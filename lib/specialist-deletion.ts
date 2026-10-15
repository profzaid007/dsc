import pb from "@/lib/pb"

export interface SpecialistDeletionLink {
  id: string
  label: string
  href?: string
  detail?: string
}

export class SpecialistDeletionBlockedError extends Error {
  constructor(
    message: string,
    public links: SpecialistDeletionLink[],
    public total: number
  ) {
    super(message)
    this.name = "SpecialistDeletionBlockedError"
  }
}

const PAGE_SIZE = 50

export async function deleteSpecialistItem(
  kind: "category" | "role",
  id: string,
  ar = false
) {
  if (kind === "category") {
    const linked = await pb
      .collection("roles_management")
      .getList(1, PAGE_SIZE, {
        filter: pb.filter("category = {:id}", { id }),
        fields: "id,role_name_en,role_name_ar",
      })
    if (linked.items.length)
      throw new SpecialistDeletionBlockedError(
        ar
          ? "لا يمكن حذف فئة تحتوي على أدوار. انقل الأدوار أو احذف الأدوار غير المستخدمة أولاً."
          : "This category contains roles. Move them or delete unused roles first.",
        linked.items.map((role) => ({
          id: role.id,
          label:
            (ar ? role.role_name_ar : role.role_name_en) ||
            role.role_name_en ||
            role.role_name_ar ||
            role.id,
        })),
        linked.totalItems
      )
  } else {
    const [profiles, assignments] = await Promise.all([
      pb.collection("expert_profiles").getList(1, PAGE_SIZE, {
        filter: pb.filter("specialist_roles ?= {:id}", { id }),
        expand: "user",
        fields: "id,user,public_name_en,public_name_ar,expand.user.name",
      }),
      pb.collection("case_experts").getList(1, PAGE_SIZE, {
        filter: pb.filter("role_id = {:id}", { id }),
        expand: "case_id,expert_id",
        fields:
          "id,case_id,expert_id,expand.case_id.id,expand.case_id.name,expand.expert_id.name",
      }),
    ])
    if (profiles.items.length || assignments.items.length) {
      const links: SpecialistDeletionLink[] = [
        ...assignments.items.map((assignment) => ({
          id: `assignment-${assignment.id}`,
          label: `${ar ? "الحالة" : "Case"}: ${assignment.expand?.case_id?.name || assignment.case_id}`,
          href: assignment.case_id
            ? `/dashboard/admin/cases/${encodeURIComponent(assignment.case_id)}`
            : undefined,
          detail: assignment.expand?.expert_id?.name
            ? `${ar ? "الخبير المسند" : "Assigned expert"}: ${assignment.expand.expert_id.name}`
            : undefined,
        })),
        ...profiles.items.map((profile) => ({
          id: `profile-${profile.id}`,
          label: `${ar ? "ملف الخبير" : "Expert profile"}: ${(ar ? profile.public_name_ar : profile.public_name_en) || profile.expand?.user?.name || profile.user}`,
          href: profile.user
            ? `/dashboard/admin/experts/${encodeURIComponent(profile.user)}`
            : undefined,
        })),
      ]
      throw new SpecialistDeletionBlockedError(
        ar
          ? "هذا الدور مرتبط بالعناصر التالية. غيّر الدور أو أزل الإسناد أولاً، أو عطّل الدور بدلاً من حذفه."
          : "This role is linked to the items below. Reassign or remove the links first, or deactivate the role instead.",
        links,
        profiles.totalItems + assignments.totalItems
      )
    }
  }
  await pb
    .collection(
      kind === "category" ? "specialist_role_categories" : "roles_management"
    )
    .delete(id)
}

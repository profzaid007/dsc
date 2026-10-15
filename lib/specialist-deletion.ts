import pb from "@/lib/pb"

export async function deleteSpecialistItem(
  kind: "category" | "role",
  id: string,
  ar = false
) {
  if (kind === "category") {
    const linked = await pb.collection("roles_management").getList(1, 1, {
      filter: pb.filter("category = {:id}", { id }),
      fields: "id",
    })
    if (linked.items.length)
      throw new Error(
        ar
          ? "لا يمكن حذف فئة تحتوي على أدوار. انقل الأدوار أو احذف الأدوار غير المستخدمة أولاً."
          : "This category contains roles. Move them or delete unused roles first."
      )
  } else {
    const [profiles, assignments] = await Promise.all([
      pb
        .collection("expert_profiles")
        .getList(1, 1, {
          filter: pb.filter("specialist_roles ?= {:id}", { id }),
          fields: "id",
        }),
      pb
        .collection("case_experts")
        .getList(1, 1, {
          filter: pb.filter("role_id = {:id}", { id }),
          fields: "id",
        }),
    ])
    if (profiles.items.length || assignments.items.length)
      throw new Error(
        ar
          ? "هذا الدور مرتبط بخبراء أو إسنادات حالات. يمكنك تعطيله بدلاً من حذفه."
          : "This role is used by experts or case assignments. Deactivate it instead."
      )
  }
  await pb
    .collection(
      kind === "category" ? "specialist_role_categories" : "roles_management"
    )
    .delete(id)
}

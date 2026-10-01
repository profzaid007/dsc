"use client";

import { useCallback, useEffect, useState } from "react";
import pb, { getErrorMessage } from "@/lib/pb";
import type { ExpertProfile, ExpertProfileDraft } from "@/types/expert";

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

/**
 * Normalizes a PocketBase field that may hold an array, a single value, or a
 * comma separated string into a clean list of strings.
 */
export function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item).trim())
      .filter((item) => item.length > 0);
  }
  const single = toText(value).trim();
  if (!single) return [];
  return single
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function emptyDraft(name = ""): ExpertProfileDraft {
  return {
    name,
    countryOfResidence: "",
    city: "",
    whatsappCountryCode: "",
    whatsappNumber: "",
    highestAcademicDegree: "",
    degreeTitle: "",
    fieldOfStudy: "",
    ageGroup: [],
    specialization: [],
    consultationMode: "",
    fee: "",
    availability: "",
    bio: "",
    newPhoto: null,
    removePhoto: false,
    keptCv: [],
    newCv: [],
  };
}

/**
 * Builds an editable draft out of a stored profile record. A null record (an
 * expert with no profile row yet) yields an empty draft that save() creates.
 */
export function draftFromProfile(
  profile: ExpertProfile | null,
  name = ""
): ExpertProfileDraft {
  if (!profile) return emptyDraft(name);
  return {
    name,
    countryOfResidence: toText(profile.country_of_residence),
    city: toText(profile.city),
    whatsappCountryCode: toText(profile.whatsapp_country_code),
    whatsappNumber: toText(profile.whatsapp_number),
    highestAcademicDegree: toText(profile.highest_academic_degree),
    degreeTitle: toText(profile.degree_title),
    fieldOfStudy: toText(profile.field_of_study),
    ageGroup: toStringList(profile.age_group),
    specialization: toStringList(profile.specialization_type),
    consultationMode: toText(profile.consultation_mode),
    fee: toText(profile.fee),
    availability: toText(profile.availability),
    bio: toText(profile.bio),
    newPhoto: null,
    removePhoto: false,
    keptCv: toStringList(profile.cv),
    newCv: [],
  };
}

/**
 * Builds a private file URL using the short-lived PocketBase file token, which
 * is required when the file's collection is not publicly readable.
 */
export function profileFileUrl(
  profile: ExpertProfile | null,
  filename: string,
  fileToken: string
): string {
  if (!profile || !filename) return "";
  return pb.files.getURL(
    profile as never,
    filename,
    fileToken ? { token: fileToken } : {}
  );
}

/** The stored profile photo filename, or "" when none is set. */
export function profilePhotoName(profile: ExpertProfile | null): string {
  return toText(profile?.profile_photo);
}

export function useExpertProfile(userId?: string) {
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [fileToken, setFileToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError("");
    try {
      const record = await pb
        .collection("expert_profiles")
        .getFirstListItem(`user = "${userId}"`);
      setProfile(record as unknown as ExpertProfile);
    } catch (error) {
      // An expert without a profile row is a valid state, not a failure.
      const status = (error as { status?: number }).status;
      if (status === 404) {
        setProfile(null);
      } else {
        setProfile(null);
        setLoadError(getErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    pb.files
      .getToken()
      .then((token) => {
        if (!cancelled) setFileToken(token);
      })
      .catch(() => {
        if (!cancelled) setFileToken("");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (draft: ExpertProfileDraft) => {
      if (!userId) throw new Error("No signed-in expert");
      setIsSaving(true);
      try {
        // The users row is updated first on purpose: PocketBase syncs the
        // auth store on a self-update, which keeps the sidebar name in sync.
        await pb.collection("users").update(userId, {
          name: draft.name.trim(),
        });

        const formData = new FormData();
        formData.set(
          "country_of_residence",
          draft.countryOfResidence.trim()
        );
        formData.set("city", draft.city.trim());
        formData.set(
          "whatsapp_country_code",
          draft.whatsappCountryCode.trim()
        );
        formData.set("whatsapp_number", draft.whatsappNumber.trim());
        formData.set(
          "highest_academic_degree",
          draft.highestAcademicDegree
        );
        formData.set("degree_title", draft.degreeTitle.trim());
        formData.set("field_of_study", draft.fieldOfStudy.trim());
        draft.ageGroup.forEach((value) => formData.append("age_group", value));
        // The field is a multi-select, so each value is appended separately the same
    // way age_group is. A comma-joined string would be rejected by the server.
    draft.specialization.forEach((value) =>
      formData.append("specialization_type", value)
    );
        formData.set("consultation_mode", draft.consultationMode);
        formData.set("fee", draft.fee.trim());
        formData.set("availability", draft.availability.trim());
        formData.set("bio", draft.bio.trim());

        // An empty string clears a single-file field in PocketBase.
        if (draft.removePhoto) {
          formData.set("profile_photo", "");
        } else if (draft.newPhoto) {
          formData.append("profile_photo", draft.newPhoto);
        }

        // Re-sending stored filenames preserves the documents on the record;
        // anything the expert removed is simply left out.
        draft.keptCv.forEach((filename) => formData.append("cv", filename));
        draft.newCv.forEach((file) => formData.append("cv", file));

        const collection = pb.collection("expert_profiles");
        if (!profile?.id) {
          formData.set("user", userId);
        }
        const saved = profile?.id
          ? await collection.update(profile.id, formData)
          : await collection.create(formData);

        setProfile(saved as unknown as ExpertProfile);
        return saved as unknown as ExpertProfile;
      } finally {
        setIsSaving(false);
      }
    },
    [userId, profile?.id]
  );

  return {
    profile,
    fileToken,
    isLoading,
    isSaving,
    loadError,
    reload: load,
    save,
  };
}
import { useTranslations } from "next-intl";
import { InlineEditableField } from "@/components/shared";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileSectionProps {
  avatarUrl: string | null;
  avatarUploading: boolean;
  onAvatarEdit: () => void;
  nickname: string | null;
  onNicknameSave: (value: string) => Promise<void>;
  bio: string | null;
  onBioSave: (value: string) => Promise<void>;
}

export function ProfileSection({
  avatarUrl,
  avatarUploading,
  onAvatarEdit,
  nickname,
  onNicknameSave,
  bio,
  onBioSave,
}: ProfileSectionProps) {
  const t = useTranslations("dashboard.profile");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Avatar */}
        <div className="flex justify-end mb-4">
          <Avatar
            src={avatarUrl}
            size="md"
            editable
            onEdit={onAvatarEdit}
            loading={avatarUploading}
          />
        </div>

        {/* Nickname with inline editing */}
        <InlineEditableField
          label={t("nickname.label")}
          value={nickname}
          onSave={onNicknameSave}
          placeholder={t("nickname.placeholder")}
        />

        {/* Bio with inline editing */}
        <InlineEditableField
          label={t("bio.label")}
          value={bio}
          onSave={onBioSave}
          placeholder={t("bio.placeholder")}
          multiline
          emptyText={t("bio.empty")}
        />
      </CardContent>
    </Card>
  );
}

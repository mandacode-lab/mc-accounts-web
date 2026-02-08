import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { InlineEditableField } from "@/components/shared";

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

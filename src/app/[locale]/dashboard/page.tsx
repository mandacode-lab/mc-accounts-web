"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useGetV1Profile, useGetV1Mfa, usePostV1MfaTotp, useDeleteV1MfaMfaId, useDeleteV1Account, usePostV1MfaTotpVerify, usePutV1Profile } from "@/lib/api/accounts";
import { useRouter } from "next/navigation";
import { usePostV1AuthLogout, usePostV1AuthPassword } from "@/lib/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { ProfileSection } from "@/components/dashboard";
import { PasswordChangeForm } from "@/components/dashboard";
import { MfaSection } from "@/components/dashboard";
import { AvatarUploadModal } from "@/components/dashboard";
import { DeleteAccountModal } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui";
import type { InternalAdapterHttpHandlerProfileGetProfileResponse } from "@/lib/api/schemas/accounts";
import type { InternalAdapterHttpHandlerMfaMFAItemResponse } from "@/lib/api/schemas/accounts";
import type { InternalAdapterHttpHandlerMfaAssignTOTPResponse } from "@/lib/api/schemas/accounts";
import { useAuth } from "@/lib/hooks/useAuth";
import { ERROR_MESSAGES } from "@/lib/errors";

type TabType = "profile" | "security";

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const { accessToken, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const queryClient = useQueryClient();
  const { data: profile, isLoading, status } = useGetV1Profile({
    query: {
      enabled: !!accessToken
    },
    fetch: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  }, queryClient);
  const logoutMutation = usePostV1AuthLogout({}, queryClient);

  useEffect(() => {
    if (!accessToken) return;

    if (!isLoading) {
      const hasErrorInData = profile?.data && 'error' in profile.data;
      if (status === 'error' || hasErrorInData || !profile?.data) {
        logout();
      }
    }
  }, [isLoading, profile, status, accessToken, logout]);

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Local profile state for optimistic updates
  const [localProfile, setLocalProfile] = useState<{
    nickname: string | null;
    bio: string | null;
    avatar_url: string | null;
  }>({
    nickname: null,
    bio: null,
    avatar_url: null
  });

  const updateProfile = usePutV1Profile({
    fetch: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  }, queryClient);

  useEffect(() => {
    if (profile?.data && !('error' in profile.data)) {
      const data = profile.data as InternalAdapterHttpHandlerProfileGetProfileResponse;
      setLocalProfile({
        nickname: data.nickname || null,
        bio: data.bio || null,
        avatar_url: data.avatar_url || null
      });
    }
  }, [profile?.data]);


  const handleAvatarEdit = () => {
    setShowAvatarModal(true);
  };

  const handleAvatarUploadConfirm = async (url: string) => {
    setAvatarUploading(true);
    try {
      await updateProfile.mutateAsync({
        data: { avatar_url: url }
      });

      setLocalProfile(prev => ({ ...prev, avatar_url: url }));
      setShowAvatarModal(false);

      queryClient.invalidateQueries({ queryKey: ['getV1Profile'] });
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarModalCancel = () => {
    setShowAvatarModal(false);
  };

  const handleNicknameSave = async (value: string) => {
    await updateProfile.mutateAsync({
      data: { nickname: value }
    });
    setLocalProfile(prev => ({ ...prev, nickname: value }));
    queryClient.invalidateQueries({ queryKey: ['getV1Profile'] });
  };

  const handleBioSave = async (value: string) => {
    await updateProfile.mutateAsync({
      data: { bio: value }
    });
    setLocalProfile(prev => ({ ...prev, bio: value }));
    queryClient.invalidateQueries({ queryKey: ['getV1Profile'] });
  };

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
    }
  }, [accessToken, router]);

  const performLogout = async () => {
    try {
      await logoutMutation.mutateAsync(undefined);
      logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const changePassword = usePostV1AuthPassword({
    fetch: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  }, queryClient);

  const handlePasswordChange = async (data: { current_password: string; new_password: string }) => {
    await changePassword.mutateAsync({ data });
  };

  const { data: mfaData, isLoading: mfaLoading, refetch: refetchMfa } = useGetV1Mfa({
    query: {
      enabled: !!accessToken
    },
    fetch: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  }, queryClient);

  const addMfa = usePostV1MfaTotp({
    fetch: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  }, queryClient);
  const deleteMfa = useDeleteV1MfaMfaId({
    fetch: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  }, queryClient);
  const verifyMfa = usePostV1MfaTotpVerify({
    fetch: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  }, queryClient);

  useEffect(() => {
    if (activeTab === "security") {
      refetchMfa();
    }
  }, [activeTab, refetchMfa]);

  const handleAddMfa = async (name: string) => {
    const response = await addMfa.mutateAsync({
      data: { name }
    });
    const data = response.data as InternalAdapterHttpHandlerMfaAssignTOTPResponse;
    return {
      qr_code_url: data.qr_code_url || "",
      session_key: data.session_key || ""
    };
  };

  const handleVerifyMfa = async (sessionKey: string, totpCode: string) => {
    await verifyMfa.mutateAsync({
      data: {
        session_key: sessionKey,
        totp_code: totpCode,
      },
    });
    refetchMfa();
  };

  const handleDeleteMfa = async (mfaId: string) => {
    await deleteMfa.mutateAsync({ mfaId });
    refetchMfa();
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteAccount = useDeleteV1Account({
    fetch: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  }, queryClient);

  const handleDeleteAccount = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (deleteConfirmation !== "계정 삭제") {
      setDeleteError("'계정 삭제'를 정확히 입력해주세요.");
      return;
    }

    try {
      await deleteAccount.mutateAsync(undefined);
      logout();
    } catch (err) {
      console.error("Delete account error:", err);
      setDeleteError(ERROR_MESSAGES.ACCOUNT_DELETE_FAILED);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-secondary flex min-h-screen items-center justify-center">
        <div className="text-card-foreground">{t('loading')}</div>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  const demoProfile = {
    nickname: t('profile.demoNickname'),
    bio: t('profile.demoBio'),
    avatar_url: null
  };

  const apiProfile = !profile?.data || 'error' in profile.data ? demoProfile : (profile.data as InternalAdapterHttpHandlerProfileGetProfileResponse);
  const displayProfile = {
    nickname: localProfile.nickname !== null ? localProfile.nickname : (apiProfile.nickname ?? null),
    bio: localProfile.bio !== null ? localProfile.bio : (apiProfile.bio ?? null),
    avatar_url: localProfile.avatar_url !== null ? localProfile.avatar_url : (apiProfile.avatar_url ?? null)
  };

  const mfaList = mfaData?.data && !('error' in mfaData.data)
    ? ((mfaData.data as { mfas?: InternalAdapterHttpHandlerMfaMFAItemResponse[] }).mfas || [])
      .filter((mfa): mfa is InternalAdapterHttpHandlerMfaMFAItemResponse & { mfa_id: string; name: string; mfa_type: string } =>
        !!mfa.mfa_id && !!mfa.name && !!mfa.mfa_type
      )
    : [];

  const NavItem = ({ tab, label }: { tab: TabType; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full text-left px-4 py-2 rounded-md transition-colors ${activeTab === tab
        ? "bg-accent text-card-foreground font-medium"
        : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-secondary min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary rounded-lg size-8 flex items-center justify-center">
                <span className="font-bold text-primary-foreground">M</span>
              </div>
              <h1 className="text-xl font-semibold text-card-foreground">
                {t('title')}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={performLogout}
                disabled={logoutMutation.isPending}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {logoutMutation.isPending ? t('logoutLoading') : t('logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4 sticky top-8">
              <nav className="space-y-1">
                <NavItem tab="profile" label={t('tabs.profile')} />
                <NavItem tab="security" label={t('tabs.security')} />
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <ProfileSection
                  avatarUrl={displayProfile.avatar_url}
                  avatarUploading={avatarUploading}
                  onAvatarEdit={handleAvatarEdit}
                  nickname={displayProfile.nickname}
                  onNicknameSave={handleNicknameSave}
                  bio={displayProfile.bio}
                  onBioSave={handleBioSave}
                />

                {/* Account Deletion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive">{t('dangerZone.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-card-foreground">
                        {t('dangerZone.deleteAccount.description')}
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteModal(true)}
                        fullWidth
                      >
                        {t('dangerZone.deleteAccount.button')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <PasswordChangeForm
                  onSubmit={handlePasswordChange}
                  isPending={changePassword.isPending}
                />

                <MfaSection
                  mfaList={mfaList}
                  isLoading={mfaLoading}
                  onAdd={handleAddMfa}
                  onVerify={handleVerifyMfa}
                  onDelete={handleDeleteMfa}
                  isAdding={addMfa.isPending}
                  isVerifying={verifyMfa.isPending}
                  isDeleting={deleteMfa.isPending}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={showAvatarModal}
        onClose={handleAvatarModalCancel}
        onConfirm={handleAvatarUploadConfirm}
        currentAvatarUrl={displayProfile.avatar_url}
        isUploading={avatarUploading}
      />

      {/* Account Deletion Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteError(null);
          setDeleteConfirmation("");
        }}
        onSubmit={handleDeleteAccount}
        confirmation={deleteConfirmation}
        onConfirmationChange={setDeleteConfirmation}
        error={deleteError}
        isDeleting={deleteAccount.isPending}
      />
    </div>
  );
}

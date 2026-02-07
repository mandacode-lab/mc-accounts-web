"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useGetV1Profile, useGetV1Mfa, usePostV1MfaTotp, useDeleteV1MfaMfaId, useDeleteV1Account, usePostV1MfaTotpVerify, usePutV1Profile } from "@/lib/api/accounts";
import { useAuthStore } from "@/lib/store/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { usePostV1AuthLogout, usePostV1AuthPassword } from "@/lib/api/auth";
import { useQueryClient } from "@tanstack/react-query";

type TabType = "profile" | "security";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function DashboardPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const queryClient = useQueryClient();
  const { data: profile, isLoading, error } = useGetV1Profile({
    query: {
      enabled: !!accessToken
    },
    fetch: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  }, queryClient);
  const logout = usePostV1AuthLogout({}, queryClient);

  // Inline editing states
  const [editingNickname, setEditingNickname] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameSaving, setNicknameSaving] = useState(false);

  const [bio, setBio] = useState("");
  const [bioSaving, setBioSaving] = useState(false);
  const [bioSaved, setBioSaved] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);

  // Avatar upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Update local profile when API data changes
  useEffect(() => {
    if (profile?.data && !('error' in profile.data)) {
      const data = profile.data as any;
      setLocalProfile({
        nickname: data.nickname || null,
        bio: data.bio || null,
        avatar_url: data.avatar_url || null
      });
    }
  }, [profile?.data]);

  // Initialize bio and nickname from profile
  useEffect(() => {
    if (profile?.data && !('error' in profile.data)) {
      const data = profile.data as any;
      if (bio === "") {
        setBio(data.bio || "");
      }
      if (editingNickname === "") {
        setEditingNickname(data.nickname || "");
      }
      if (data.avatar_url) {
        setAvatarPreview(data.avatar_url);
      }
    }
  }, [profile?.data]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedAvatarFile(file);

    // Create preview for modal and show modal immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreviewUrl(reader.result as string);
      setShowAvatarModal(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle avatar upload confirmation
  const handleAvatarUploadConfirm = async () => {
    if (!selectedAvatarFile) return;

    setAvatarUploading(true);
    try {
      // Upload avatar (convert to base64 for API)
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedAvatarFile);
      });

      await updateProfile.mutateAsync({
        data: { avatar_url: base64 }
      });

      // Update local profile immediately
      setLocalProfile(prev => ({ ...prev, avatar_url: base64 }));
      setAvatarPreview(base64);
      setShowAvatarModal(false);
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl(null);

      // Invalidate and refetch to ensure cache is updated
      queryClient.invalidateQueries({ queryKey: ['getV1Profile'] });
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Handle avatar modal cancel
  const handleAvatarModalCancel = () => {
    setShowAvatarModal(false);
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle inline nickname save
  const handleNicknameInlineSave = async () => {
    if (!editingNickname.trim() || nicknameSaving) return;

    const newNickname = editingNickname;
    const oldNickname = displayProfile?.nickname || "";

    setNicknameSaving(true);
    try {
      await updateProfile.mutateAsync({
        data: { nickname: newNickname }
      });

      // Update local profile immediately
      setLocalProfile(prev => ({ ...prev, nickname: newNickname }));
      setIsEditingNickname(false);

      // Invalidate and refetch to ensure cache is updated
      queryClient.invalidateQueries({ queryKey: ['getV1Profile'] });
    } catch (err) {
      console.error("Nickname update error:", err);
      // Revert on error
      setEditingNickname(oldNickname);
    } finally {
      setNicknameSaving(false);
    }
  };

  // Handle inline bio save
  const handleBioInlineSave = async () => {
    if (bioSaving) return;

    const newBio = bio;
    setBioSaving(true);
    setBioSaved(false);
    try {
      await updateProfile.mutateAsync({
        data: { bio: newBio }
      });

      // Update local profile immediately
      setLocalProfile(prev => ({ ...prev, bio: newBio }));
      setBioSaved(true);
      setIsEditingBio(false);
      setTimeout(() => setBioSaved(false), 2000);

      // Invalidate and refetch to ensure cache is updated
      queryClient.invalidateQueries({ queryKey: ['getV1Profile'] });
    } catch (err) {
      console.error("Bio update error:", err);
    } finally {
      setBioSaving(false);
    }
  };

  // Wait for Zustand persist hydration
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (hasHydrated && !accessToken) {
      router.push("/login");
    }
  }, [hasHydrated, accessToken, router]);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync(undefined);
      setAccessToken(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const changePassword = usePostV1AuthPassword({
    fetch: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  }, queryClient);

  // MFA Management
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
  const [showAddMfa, setShowAddMfa] = useState(false);
  const [mfaName, setMfaName] = useState("");
  const [mfaType, setMfaType] = useState<"totp" | "sms" | "email">("totp");
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");

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

  const handleAddMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    setMfaSuccess(false);
    setQrCodeUri(null);
    setSessionKey(null);
    setTotpCode("");

    try {
      const response = await addMfa.mutateAsync({
        data: {
          name: mfaName,
        },
      });

      if (response.status === 200) {
        const data = response.data as any;
        console.log("MFA add response:", data);
        if (data.qr_code_url) {
          setQrCodeUri(data.qr_code_url);
        }
        if (data.session_key) {
          setSessionKey(data.session_key);
        }
        setMfaSuccess(true);
        setMfaName("");
      } else {
        const errorData = response.data as { error?: string };
        setMfaError(errorData.error || "MFA 추가에 실패했습니다.");
      }
    } catch (err) {
      console.error("Add MFA error:", err);
      setMfaError("MFA 추가에 실패했습니다.");
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);

    if (!sessionKey) {
      setMfaError("세션이 만료되었습니다. 다시 시도해주세요.");
      return;
    }

    if (totpCode.length !== 6) {
      setMfaError("6자리 코드를 입력해주세요.");
      return;
    }

    try {
      const response = await verifyMfa.mutateAsync({
        data: {
          session_key: sessionKey,
          totp_code: totpCode,
        },
      });

      console.log("MFA verify response:", response);

      if (response.status === 200) {
        setMfaSuccess(true);
        setTotpCode("");
        setSessionKey(null);
        setShowAddMfa(false);
        refetchMfa();
        setTimeout(() => {
          setMfaSuccess(false);
        }, 3000);
      } else {
        const errorData = response.data as { error?: string };
        setMfaError(errorData.error || "코드 확인에 실패했습니다.");
      }
    } catch (err) {
      console.error("Verify MFA error:", err);
      setMfaError("코드 확인에 실패했습니다.");
    }
  };

  const handleDeleteMfa = async (mfaId: string) => {
    setMfaError(null);
    try {
      const response = await deleteMfa.mutateAsync({
        mfaId,
      });
      if (response.status === 200) {
        refetchMfa();
      } else {
        const errorData = response.data as { error?: string };
        setMfaError(errorData.error || "MFA 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("Delete MFA error:", err);
      setMfaError("MFA 삭제에 실패했습니다.");
    }
  };

  // Account Deletion
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

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (deleteConfirmation !== "계정 삭제") {
      setDeleteError("'계정 삭제'를 정확히 입력해주세요.");
      return;
    }

    try {
      const response = await deleteAccount.mutateAsync(undefined);
      if (response.status === 200 || response.status === 204) {
        setAccessToken(null);
        router.push("/login");
      } else {
        const errorData = response.data as { error?: string };
        setDeleteError(errorData.error || "계정 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      setDeleteError("계정 삭제에 실패했습니다.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await changePassword.mutateAsync({
        data: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      });

      if (response.status === 200) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setPasswordSuccess(false);
        }, 3000);
      } else {
        const errorData = response.data as { error?: string };
        setPasswordError(errorData.error || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error("Password change error:", err);
      setPasswordError("비밀번호 변경에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-secondary flex min-h-screen items-center justify-center">
        <div className="text-card-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!hasHydrated) {
    return (
      <div className="bg-secondary flex min-h-screen items-center justify-center">
        <div className="text-card-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  // 에러가 있거나 데이터가 없으면 데모 데이터 사용
  const demoProfile = {
    nickname: "테스트 사용자",
    bio: "데모 계정입니다",
    avatar_url: null
  };

  const apiProfile = error || !profile?.data ? demoProfile : (profile.data as any);
  const displayProfile = {
    nickname: localProfile.nickname !== null ? localProfile.nickname : apiProfile.nickname,
    bio: localProfile.bio !== null ? localProfile.bio : apiProfile.bio,
    avatar_url: localProfile.avatar_url !== null ? localProfile.avatar_url : apiProfile.avatar_url
  };

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
                계정 관리
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                disabled={logout.isPending}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {logout.isPending ? "로그아웃 중..." : "로그아웃"}
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
                <NavItem tab="profile" label="프로필" />
                <NavItem tab="security" label="보안" />
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Profile Information */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-semibold text-card-foreground">
                      프로필 정보
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {/* Avatar - GitHub Style */}
                    <div className="flex justify-end">
                      <div className="relative group">
                        <div className="size-20 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Avatar"
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl text-muted-foreground">?</span>
                          )}
                        </div>
                        {avatarUploading && (
                          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        {/* GitHub-style overlay button */}
                        <div
                          className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <span className="text-white text-xs font-medium">변경</span>
                        </div>
                      </div>
                    </div>

                    {/* Nickname with inline editing */}
                    <div>
                      <label className="text-sm text-muted-foreground">닉네임</label>
                      {isEditingNickname ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={editingNickname}
                            onChange={(e) => setEditingNickname(e.target.value)}
                            onBlur={handleNicknameInlineSave}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleNicknameInlineSave();
                              } else if (e.key === "Escape") {
                                setIsEditingNickname(false);
                                setEditingNickname(displayProfile?.nickname || "");
                              }
                            }}
                            className="flex-1 bg-input border-0 rounded-md px-3 py-2 text-card-foreground placeholder:text-muted-foreground"
                            placeholder="새 닉네임 입력"
                            autoFocus
                          />
                          {nicknameSaving && (
                            <span className="text-xs text-muted-foreground">저장 중...</span>
                          )}
                        </div>
                      ) : (
                        <div
                          className="mt-1 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => setIsEditingNickname(true)}
                        >
                          <p className="text-card-foreground font-medium">
                            {displayProfile?.nickname || "설정되지 않음"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bio with inline editing */}
                    <div>
                      <label className="text-sm text-muted-foreground">소개</label>
                      {isEditingBio ? (
                        <div className="space-y-2 mt-1">
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            onBlur={handleBioInlineSave}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setIsEditingBio(false);
                                setBio(displayProfile?.bio || "");
                              }
                            }}
                            className="w-full bg-input border-0 rounded-md px-3 py-2 text-card-foreground placeholder:text-muted-foreground min-h-[100px] resize-y"
                            placeholder="소개를 입력하세요..."
                            autoFocus
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">ESC를 누르면 취소됩니다</p>
                            {bioSaving && (
                              <span className="text-xs text-muted-foreground">저장 중...</span>
                            )}
                            {bioSaved && (
                              <span className="text-xs text-green-600 dark:text-green-400">✓ 저장됨</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="mt-1 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => setIsEditingBio(true)}
                        >
                          <p className="text-card-foreground">
                            {displayProfile?.bio || "소개가 없습니다. 클릭하여 추가하세요."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Deletion */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-destructive mb-4">
                    위험 영역
                  </h2>
                  <div className="space-y-4">
                    <p className="text-sm text-card-foreground">
                      계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full px-4 py-2 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors"
                    >
                      계정 삭제
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {/* Password Change */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-card-foreground mb-4">
                    비밀번호 변경
                  </h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-card-foreground">
                        현재 비밀번호
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full bg-input border-0 rounded-md px-3 py-2 text-card-foreground placeholder:text-muted-foreground"
                        placeholder="현재 비밀번호 입력"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-card-foreground">
                        새 비밀번호
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full bg-input border-0 rounded-md px-3 py-2 text-card-foreground placeholder:text-muted-foreground"
                        placeholder="새 비밀번호 입력"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-card-foreground">
                        새 비밀번호 확인
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-input border-0 rounded-md px-3 py-2 text-card-foreground placeholder:text-muted-foreground"
                        placeholder="새 비밀번호 다시 입력"
                      />
                    </div>

                    {passwordError && (
                      <p className="text-destructive text-sm">{passwordError}</p>
                    )}

                    {passwordSuccess && (
                      <p className="text-green-600 dark:text-green-400 text-sm">
                        비밀번호가 성공적으로 변경되었습니다.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={changePassword.isPending}
                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changePassword.isPending ? "변경 중..." : "비밀번호 변경"}
                    </button>
                  </form>
                </div>

                {/* MFA Management */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-card-foreground mb-4">
                    2단계 인증 (MFA)
                  </h2>

                  {mfaError && (
                    <p className="text-destructive text-sm mb-4">{mfaError}</p>
                  )}
                  {mfaSuccess && (
                    <p className="text-green-600 dark:text-green-400 text-sm mb-4">
                      MFA가 성공적으로 추가되었습니다.
                    </p>
                  )}

                  {!showAddMfa ? (
                    <div className="space-y-4">
                      <button
                        onClick={() => setShowAddMfa(true)}
                        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                      >
                        + 새 MFA 기기 추가
                      </button>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          등록된 MFA 기기
                        </h3>
                        {mfaLoading ? (
                          <p className="text-sm text-muted-foreground">로딩 중...</p>
                        ) : mfaData?.data?.mfas && mfaData.data.mfas.length > 0 ? (
                          <div className="space-y-2">
                            {mfaData.data.mfas.map((mfa: any) => (
                              <div
                                key={mfa.mfa_id}
                                className="flex items-center justify-between p-3 bg-muted rounded-md"
                              >
                                <div>
                                  <p className="text-sm font-medium text-card-foreground">
                                    {mfa.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {mfa.mfa_type}
                                  </p>
                                  {mfa.verified !== undefined && (
                                    <p className={`text-xs ${mfa.verified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                      {mfa.verified ? '✓ 인증됨' : '⏳ 인증 대기 중'}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDeleteMfa(mfa.mfa_id)}
                                  disabled={deleteMfa.isPending}
                                  className="text-destructive hover:text-destructive-foreground text-sm disabled:opacity-50"
                                >
                                  삭제
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            등록된 MFA 기기가 없습니다.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {mfaSuccess && qrCodeUri ? (
                        <div className="space-y-4">
                          <div className="text-center">
                            <p className="text-sm font-medium text-card-foreground mb-2">
                              ✅ MFA 기기가 등록되었습니다
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                              QR 코드를 스캔하여 인증 앱에 등록하세요
                            </p>
                          </div>
                          <div className="flex justify-center p-4 bg-white rounded-md">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUri)}`}
                              alt="QR Code"
                              className="w-48 h-48"
                            />
                          </div>
                          {sessionKey ? (
                            <form onSubmit={handleVerifyMfa} className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-card-foreground">
                                  인증 코드 (6자리)
                                </label>
                                <input
                                  type="text"
                                  value={totpCode}
                                  onChange={(e) => setTotpCode(e.target.value)}
                                  maxLength={6}
                                  className="w-full bg-input border-0 rounded-md px-3 py-2 text-card-foreground placeholder:text-muted-foreground text-center text-lg tracking-widest"
                                  placeholder="000000"
                                />
                              </div>
                              <button
                                type="submit"
                                disabled={verifyMfa.isPending}
                                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {verifyMfa.isPending ? "확인 중..." : "확인"}
                              </button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddMfa(false);
                                setMfaSuccess(false);
                                setQrCodeUri(null);
                                setSessionKey(null);
                              }}
                              className="w-full px-4 py-2 bg-muted text-card-foreground hover:bg-accent rounded-md transition-colors"
                            >
                              취소
                            </button>
                          )}
                        </div>
                      ) : (
                        <form onSubmit={handleAddMfa} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-card-foreground">
                              기기 이름
                            </label>
                            <input
                              type="text"
                              value={mfaName}
                              onChange={(e) => setMfaName(e.target.value)}
                              required
                              className="w-full bg-input border-0 rounded-md px-3 py-2 text-card-foreground placeholder:text-muted-foreground"
                              placeholder="예: 내 iPhone"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-card-foreground">
                              인증 방식
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => setMfaType("totp")}
                                className={`px-4 py-2 rounded-md text-sm transition-colors ${mfaType === "totp"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-card-foreground hover:bg-accent"
                                  }`}
                              >
                                TOTP
                              </button>
                              <button
                                type="button"
                                onClick={() => setMfaType("sms")}
                                disabled
                                className={`px-4 py-2 rounded-md text-sm transition-colors ${mfaType === "sms"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground cursor-not-allowed"
                                  }`}
                              >
                                SMS
                              </button>
                              <button
                                type="button"
                                onClick={() => setMfaType("email")}
                                disabled
                                className={`px-4 py-2 rounded-md text-sm transition-colors ${mfaType === "email"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground cursor-not-allowed"
                                  }`}
                              >
                                이메일
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {mfaType === "totp" && "Google Authenticator 같은 TOTP 앱을 사용합니다."}
                              {mfaType === "sms" && "SMS 메시지로 인증 코드를 받습니다 (준비 중)"}
                              {mfaType === "email" && "이메일로 인증 코드를 받습니다 (준비 중)"}
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddMfa(false);
                                setMfaName("");
                              }}
                              className="flex-1 px-4 py-2 border border-border rounded-md text-card-foreground hover:bg-accent transition-colors"
                            >
                              취소
                            </button>
                            <button
                              type="submit"
                              disabled={addMfa.isPending}
                              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {addMfa.isPending ? "추가 중..." : "추가"}
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md">
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-card-foreground">
                  프로필 사진 변경
                </h2>
                <button
                  onClick={handleAvatarModalCancel}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Preview */}
                <div className="flex justify-center">
                  <div className="size-32 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
                    {avatarPreviewUrl ? (
                      <img
                        src={avatarPreviewUrl}
                        alt="Preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-muted-foreground">?</span>
                    )}
                  </div>
                </div>

                {/* File Info */}
                {selectedAvatarFile && (
                  <div className="text-center">
                    <p className="text-sm text-card-foreground">
                      {selectedAvatarFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedAvatarFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAvatarModalCancel}
                    disabled={avatarUploading}
                    className="flex-1 px-4 py-2 border border-border rounded-md text-card-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAvatarUploadConfirm}
                    disabled={avatarUploading}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {avatarUploading ? "업로드 중..." : "변경"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md">
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-destructive">
                  계정 삭제
                </h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteError(null);
                    setDeleteConfirmation("");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleDeleteAccount} className="p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-card-foreground">
                    이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    계정을 삭제하려면 아래에 <span className="font-mono bg-muted px-1 rounded">계정 삭제</span>를 입력하세요.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    확인을 위해 '계정 삭제' 입력
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    required
                    className="w-full bg-input border-0 rounded-md px-3 py-2 text-card-foreground placeholder:text-muted-foreground"
                    placeholder="계정 삭제"
                  />
                </div>

                {/* Error Message */}
                {deleteError && (
                  <p className="text-destructive text-sm">{deleteError}</p>
                )}

                {/* Warning */}
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive font-medium">
                    경고
                  </p>
                  <p className="text-xs text-destructive mt-1">
                    계정을 삭제하면 모든 프로필 정보, MFA 설정, 활성 세션이 즉시 삭제됩니다.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteError(null);
                      setDeleteConfirmation("");
                    }}
                    className="flex-1 px-4 py-2 border border-border rounded-md text-card-foreground hover:bg-accent transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={deleteAccount.isPending || deleteConfirmation !== "계정 삭제"}
                    className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteAccount.isPending ? "삭제 중..." : "계정 삭제"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

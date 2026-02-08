export const ERROR_MESSAGES = {
  // Auth errors
  LOGIN_FAILED: "로그인에 실패했습니다.",
  MFA_VERIFICATION_FAILED: "MFA 인증에 실패했습니다.",
  TOTP_CODE_REQUIRED: "6자리 코드를 입력해주세요.",
  LOGOUT_FAILED: "로그아웃에 실패했습니다.",

  // Signup errors
  SIGNUP_FAILED: "회원가입에 실패했습니다.",
  PASSWORD_TOO_SHORT: "비밀번호는 최소 8자 이상이어야 합니다.",
  PASSWORD_MISMATCH: "비밀번호가 일치하지 않습니다.",

  // Profile errors
  PROFILE_UPDATE_FAILED: "프로필 업데이트에 실패했습니다.",
  AVATAR_UPLOAD_FAILED: "아바타 업로드에 실패했습니다.",

  // Password change errors
  PASSWORD_CHANGE_FAILED: "비밀번호 변경에 실패했습니다.",
  PASSWORD_CHANGE_SUCCESS: "비밀번호가 성공적으로 변경되었습니다.",

  // MFA errors
  MFA_ADD_FAILED: "MFA 추가에 실패했습니다.",
  MFA_DELETE_FAILED: "MFA 삭제에 실패했습니다.",
  MFA_VERIFY_FAILED: "MFA 인증에 실패했습니다.",

  // Account deletion
  ACCOUNT_DELETE_FAILED: "계정 삭제에 실패했습니다.",
  ACCOUNT_DELETE_CONFIRMATION: "계정 삭제",

  // General errors
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다.",
} as const;

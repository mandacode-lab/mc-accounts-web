import { z } from "zod";
import { UI_CONSTANTS } from "@/lib/constants";

export const loginSchema = z.object({
  id: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    identity: z.string().min(1, "아이디를 입력해주세요."),
    password: z
      .string()
      .min(
        UI_CONSTANTS.PASSWORD_MIN_LENGTH,
        `비밀번호는 최소 ${UI_CONSTANTS.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
      ),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, "현재 비밀번호를 입력해주세요."),
    new_password: z
      .string()
      .min(
        UI_CONSTANTS.PASSWORD_MIN_LENGTH,
        `비밀번호는 최소 ${UI_CONSTANTS.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
      ),
    confirm_password: z.string().min(1, "새 비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirm_password"],
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

export const totpSchema = z.object({
  totp: z
    .string()
    .length(
      UI_CONSTANTS.TOTP_CODE_LENGTH,
      `TOTP 코드는 ${UI_CONSTANTS.TOTP_CODE_LENGTH}자리여야 합니다.`,
    ),
});

export type TotpFormValues = z.infer<typeof totpSchema>;

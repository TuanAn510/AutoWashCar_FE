export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/;
export const PASSWORD_RULE_MESSAGE =
  'Mật khẩu phải chứa ít nhất 1 chữ cái, 1 số, và ít nhất 8 ký tự.';
export const PHONE_RULE = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
export const PHONE_RULE_MESSAGE =
  'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ.';

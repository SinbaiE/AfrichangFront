import speakeasy from 'speakeasy';

export const generate2FASecret = (userEmail: string, appName: string = 'MonApp') => {
  return speakeasy.generateSecret({
    name: userEmail,
    issuer: appName,
    length: 32,
  });
};

export const verify2FAToken = (secret: string, token: string) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Permet une tolérance de 2 périodes (60 secondes)
  });
};

export const generateQRCodeURL = (secret: string, userEmail: string, appName: string) => {
  return speakeasy.otpauthURL({
    secret,
    label: userEmail,
    issuer: appName,
    encoding: 'base32',
  });
};

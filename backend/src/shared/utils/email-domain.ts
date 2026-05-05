const INSTITUTIONAL_DOMAIN = 'sou.inteli.edu.br';

export const isInstitutionalEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain === INSTITUTIONAL_DOMAIN;
};

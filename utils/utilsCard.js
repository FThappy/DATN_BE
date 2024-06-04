export const checkValidCard = (card) => {
  const cardPattern = /^\d{16}$/;

  return cardPattern.test(card);
};

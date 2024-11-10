export const transformPhoneNumber = (phone) => {
    // Remove all spaces from the input
    const cleanedPhone = phone.replace(/\s+/g, "") ?? "";
    const uzbNumStart = /^998\d{9}$/;
    const uzbNumStartWithPlus = /^\+998\d{9}$/;
  
    if (cleanedPhone.length === 9) {
      return (
        "+998" +
        cleanedPhone.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4")
      );
    } else if (uzbNumStart.test(cleanedPhone) && cleanedPhone.length === 12) {
      return (
        "+" +
        cleanedPhone.replace(
          /(\d{4})(\d{2})(\d{3})(\d{2})(\d{2})/,
          "$1 $2 $3 $4 $5"
        )
      );
    } else if (
      uzbNumStartWithPlus.test(cleanedPhone) &&
      cleanedPhone.length === 13
    ) {
      return cleanedPhone.replace(/(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
    }
    // If no specific format is needed, return the cleaned phone number
    return cleanedPhone;
  };
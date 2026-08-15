const AppError = require("../utils/AppError");


// ======================================================
// Calculate Refund
// ======================================================

const calculateRefund = (eventDate, totalAmount) => {

  const currentDate = new Date();
  const eventDateTime = new Date(eventDate);

  // Calculate difference in days
  const differenceInMilliseconds =
    eventDateTime.getTime() -
    currentDate.getTime();

  const daysUntilEvent =
    Math.ceil(
      differenceInMilliseconds /
        (1000 * 60 * 60 * 24)
    );


  let refundPercentage = 0;


  // 6 or more days → 70%
  if (daysUntilEvent >= 6) {
    refundPercentage = 70;
  }

  // 3-5 days → 50%
  else if (
    daysUntilEvent >= 3 &&
    daysUntilEvent <= 5
  ) {
    refundPercentage = 50;
  }

  // 1-2 days → 20%
  else if (
    daysUntilEvent >= 1 &&
    daysUntilEvent <= 2
  ) {
    refundPercentage = 20;
  }

  // Event day / past event → 0%
  else {
    refundPercentage = 0;
  }


  const refundAmount =
    (totalAmount * refundPercentage) / 100;


  return {
    daysUntilEvent,
    refundPercentage,
    refundAmount,
  };
};


module.exports = {
  calculateRefund,
};
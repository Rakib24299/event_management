const QRCode = require("qrcode");

// Generate QR Code
const generateQRCode = async (data) => {
  const qrCode = await QRCode.toDataURL(
    JSON.stringify(data)
  );

  return qrCode;
};

module.exports = {
  generateQRCode,
};
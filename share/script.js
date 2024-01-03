new QRCode(document.getElementById("qrcode"), {
  text: "https://tylergordonhill.com/",
  width: 512,
  height: 512,
  colorDark : "#000000",
  colorLight : "#ffffff",
  correctLevel : QRCode.CorrectLevel.H
});

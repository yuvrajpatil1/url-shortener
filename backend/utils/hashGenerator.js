function shortURL(longUrl) {
  const p = 31;
  const m = 1000000009;
  let hash = 0;
  let power = 1;

  for (let i = 0; i < longUrl.length; i++) {
    const ch = longUrl.charCodeAt(i);
    hash = (hash + ((ch * power) % m)) % m;
    power = (power * p) % m;
  }

  return toBase62(hash);
}

function toBase62(number) {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let shortUrl = "";

  while (number > 0) {
    const index = number % 62;
    shortUrl = chars.charAt(index) + shortUrl;
    number = Math.floor(number / 62);
  }

  if (shortUrl === "") return "0";

  return shortUrl;
}

module.exports = { shortURL };

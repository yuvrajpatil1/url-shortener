public class HashGenerator {

    public static String shortURL(String longUrl) {
        int p = 31;
        int m = 1000000009;
        long hash = 0;
        long power = 1;

        for (int i = 0; i < longUrl.length(); i++) {
            char ch = longUrl.charAt(i);
            hash = (hash + (ch * power) % m) % m;
            power = (power * p) % m;
        }

        // Convert to Base62 to make it short and URL-friendly
        return toBase62(hash);
    }

    private static String toBase62(long number) {
        String chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        StringBuilder shortUrl = new StringBuilder();

        while (number > 0) {
            int index = (int) (number % 62);
            shortUrl.append(chars.charAt(index));
            number /= 62;
        }

        return shortUrl.reverse().toString(); // make it in correct order
    }

    // For testing
    public static void main(String[] args) {
        if (args.length > 0) {
            String longUrl = args[0];
            String shortCode = shortURL(longUrl);
            System.out.println(shortCode); // ✅ Only the code
        }
    }

}

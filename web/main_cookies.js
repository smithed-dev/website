/**
 * Simple utility for getting and setting cookies.
 */
class Cookies {
  /**
   * Get the value of a cookie by name.
   * @param {string} name - The name of the cookie.
   * @returns {string|null} The cookie value, or null if not found.
   */
  static get(name) {
    const match = document.cookie.match(
      new RegExp(
        "(?:^|; )" + name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1") + "=([^;]*)",
      ),
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  /**
   * Set a cookie.
   * @param {string} name - The name of the cookie.
   * @param {string} value - The value to set.
   * @param {Object} [options] - Optional settings.
   * @param {number} [options.days] - Days until expiration.
   * @param {string} [options.path='/'] - Cookie path.
   * @param {string} [options.domain] - Cookie domain.
   * @param {boolean} [options.secure] - Secure flag.
   * @param {string} [options.sameSite] - SameSite attribute.
   */
  static set(name, value, options = {}) {
    let str = `${name}=${encodeURIComponent(value)}`;
    if (options.days) {
      const d = new Date();
      d.setTime(d.getTime() + options.days * 864e5);
      str += `; Expires=${d.toUTCString()}`;
    }
    str += `; Path=${options.path || "/"}`;
    if (options.domain) str += `; Domain=${options.domain}`;
    if (options.secure) str += "; Secure";
    if (options.sameSite) str += `; SameSite=${options.sameSite}`;
    document.cookie = str;
  }
}

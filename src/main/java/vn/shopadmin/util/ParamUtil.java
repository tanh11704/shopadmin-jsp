package vn.shopadmin.util;

import jakarta.servlet.http.HttpServletRequest;

public final class ParamUtil {

    private ParamUtil() {
    }

    public static String str(HttpServletRequest req, String name) {
        String v = req.getParameter(name);
        return (v == null || v.isBlank()) ? null : v.trim();
    }

    public static int intOr(HttpServletRequest req, String name, int defaultValue) {
        try {
            String v = str(req, name);
            return v == null ? defaultValue : Integer.parseInt(v);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}

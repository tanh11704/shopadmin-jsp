package vn.shopadmin.common.pagination;

import java.util.List;

public record Page<T>(List<T> items, int page, int size, int totalItems) {
    public int totalPages() {
        return (int) Math.ceil((double) totalItems / size);
    }

    public boolean hasPrev() {
        return page > 1;
    }

    public boolean hasNext() {
        return page < totalPages();
    }

    public int from() {
        return totalItems == 0 ? 0 : (page - 1) * size + 1;
    }

    public int to() {
        return (int) Math.min((long) page * size, totalItems);
    }
}

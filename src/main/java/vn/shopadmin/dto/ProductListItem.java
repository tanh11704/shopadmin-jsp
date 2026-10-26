package vn.shopadmin.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ProductListItem {
    private static final DateTimeFormatter VN = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private long id;
    private String sku;
    private String name;
    private String categoryName;
    private String imageFile;
    private long price;
    private int stock;
    private boolean active;
    private LocalDateTime createdAt;

    public ProductListItem() {
    }

    public ProductListItem(long id, String sku, String name, String categoryName, String imageFile, long price, int stock, boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.sku = sku;
        this.name = name;
        this.categoryName = categoryName;
        this.imageFile = imageFile;
        this.price = price;
        this.stock = stock;
        this.active = active;
        this.createdAt = createdAt;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getImageFile() {
        return imageFile;
    }

    public void setImageFile(String imageFile) {
        this.imageFile = imageFile;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedAtText() {
        return createdAt == null ? "" : createdAt.format(VN);
    }
}

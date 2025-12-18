package com.kanjimaster.backend.model.enums;

public enum RoleType {
    USER("USER", "Người dùng"),
    ADMIN("ADMIN", "Quản trị viên");

    private final String name;
    private final String description;

    RoleType(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public static RoleType fromString(String name) {
        for (RoleType roleType : RoleType.values()) {
            if (roleType.name.equalsIgnoreCase(name)) {
                return roleType;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + name);
    }
}

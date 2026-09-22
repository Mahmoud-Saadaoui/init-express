import express from "express";
import prisma from "../config/db.js";

export const register = async (req, res) => {
  try {

    const user = await prisma.user.create({
      data: {
        name: "Mahmoud",
        email: "mahmoud@example.com",
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
};

export const login = (req, res) => {
    res.json({ message: "User logged in successfully!" });
}


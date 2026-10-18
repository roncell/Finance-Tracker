"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

export const WelcomeMsg = () => {
    const { user, isLoaded } = useUser();

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-2 mb-4"
        >
            <h2 className="text-2xl lg:text-4xl text-white font-medium">
                Welcome Back{isLoaded && user?.firstName ? `, ${user.firstName}` : ""}
            </h2>
            <p className="text-sm lg:text-base text-blue-200/90">
                This is your Financial Overview Report.
            </p>
        </motion.div>
    );
};
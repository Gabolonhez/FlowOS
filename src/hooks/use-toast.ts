
"use client";
import * as React from "react"
export const useToast = () => ({
    toast: (props: any) => console.log("Toast:", props)
})

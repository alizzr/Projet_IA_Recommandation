import React from "react";

function SkeletonCard() {
    return (
        <div className="bg-white p-4 rounded-sm animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
                <div className="h-8 bg-gray-200 rounded-full w-full mt-4"></div>
            </div>
        </div>
    );
}

function SkeletonRow() {
    return (
        <div className="bg-white p-6 mb-6 shadow-sm mx-4 md:mx-0">
            <div className="h-6 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
}

export default function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[#EAEDED]">
            {/* Navbar skeleton */}
            <div className="bg-[#131921] h-16 animate-pulse"></div>
            <div className="bg-[#232f3e] h-10 animate-pulse"></div>

            {/* Hero skeleton */}
            <div className="max-w-[1600px] mx-auto px-4 mt-6">
                <div className="h-48 md:h-64 bg-gray-300 rounded-xl mb-6 animate-pulse"></div>
            </div>

            {/* Product rows skeleton */}
            <div className="max-w-[1600px] mx-auto px-4">
                <SkeletonRow />
                <SkeletonRow />
            </div>
        </div>
    );
}

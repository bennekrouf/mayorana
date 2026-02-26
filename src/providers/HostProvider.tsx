'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface HostContextType {
    isSwissRust: boolean;
}

const HostContext = createContext<HostContextType>({
    isSwissRust: false,
});

export function useHostContext() {
    return useContext(HostContext);
}

export function HostProvider({
    children,
    isSwissRust,
}: {
    children: ReactNode;
    isSwissRust: boolean;
}) {
    return (
        <HostContext.Provider value={{ isSwissRust }}>
            {children}
        </HostContext.Provider>
    );
}

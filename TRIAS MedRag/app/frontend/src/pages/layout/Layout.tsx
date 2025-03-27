import React, { useState, useEffect, useRef, RefObject } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Layout.module.css";

import chariteLogo from "../../assets/221215_Charite_Wortbildmarke_oU_RGB.svg";

import { IconButton } from "@fluentui/react";
import { ClearChatButton } from "../../components/ClearChatButton";
import { SettingsButton } from "../../components/SettingsButton";

// Create a context to share state between Layout and Chat components
export const LayoutContext = React.createContext<{
    clearChat?: () => void;
    setClearChatFunction?: (fn: () => void) => void;
    openSettings?: () => void;
    setOpenSettingsFunction?: (fn: () => void) => void;
}>({});

const Layout = () => {
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef: RefObject<HTMLDivElement> = useRef(null);
    const [clearChatFunction, setClearChatFunction] = useState<(() => void) | undefined>(undefined);
    const [openSettingsFunction, setOpenSettingsFunction] = useState<(() => void) | undefined>(undefined);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setMenuOpen(false);
        }
    };

    useEffect(() => {
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const handleClearChat = () => {
        if (clearChatFunction) {
            clearChatFunction();
        }
    };

    const handleOpenSettings = () => {
        if (openSettingsFunction) {
            openSettingsFunction();
        }
    };

    return (
        <LayoutContext.Provider
            value={{
                clearChat: clearChatFunction,
                setClearChatFunction,
                openSettings: openSettingsFunction,
                setOpenSettingsFunction
            }}
        >
            <div className={styles.layout}>
                <header className={styles.header} role={"banner"}>
                    <div className={styles.headerContainer} ref={menuRef}>
                        <div className={styles.logoContainer}>
                            <a
                                href="#/"
                                onClick={e => {
                                    e.preventDefault();
                                    if (clearChatFunction) {
                                        // currently deleting chat -> change when chat history is implemented
                                        clearChatFunction();
                                    }
                                }}
                            >
                                <img src={chariteLogo} alt="Charité Logo" className={styles.chariteLogo} />
                            </a>
                        </div>

                        <div className={styles.headerButtonsContainer}>
                            <ClearChatButton className={styles.headerButton} onClick={handleClearChat} disabled={!clearChatFunction} />
                            <SettingsButton className={styles.headerButton} onClick={handleOpenSettings} />
                            <IconButton
                                iconProps={{ iconName: "GlobalNavButton" }}
                                className={styles.menuToggle}
                                onClick={toggleMenu}
                                ariaLabel={t("labels.toggleMenu")}
                            />
                        </div>
                    </div>
                </header>

                <main className={styles.mainContent}>
                    <Outlet />
                </main>
            </div>
        </LayoutContext.Provider>
    );
};

export default Layout;

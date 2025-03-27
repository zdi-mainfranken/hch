import React, { useState, useEffect, useRef } from "react";
import styles from "./TypewriterEffect.module.css";

interface TypewriterEffectProps {
    phrases: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    delayAfterType?: number;
    delayAfterDelete?: number;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
    phrases,
    typingSpeed = 100,
    deletingSpeed = 50,
    delayAfterType = 9000,
    delayAfterDelete = 500
}) => {
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const currentPhrase = phrases[phraseIndex];

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // If we're deleting
        if (isDeleting) {
            setShowCursor(true);
            if (currentText === "") {
                // Done deleting, move to next phrase
                setIsDeleting(false);
                setPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
                timeoutRef.current = setTimeout(() => {
                    // This timeout creates a pause after deletion before typing the next word
                }, delayAfterDelete);
            } else {
                // Continue deleting
                timeoutRef.current = setTimeout(() => {
                    setCurrentText(currentText.slice(0, -1));
                }, deletingSpeed);
            }
        }
        // If we're typing
        else {
            if (currentText === currentPhrase) {
                // Done typing, prepare to delete after delay
                setShowCursor(false); // Hide cursor during the delay
                timeoutRef.current = setTimeout(() => {
                    setIsDeleting(true);
                    setShowCursor(true); // Show cursor again when deletion starts
                }, delayAfterType);
            } else {
                // Continue typing
                setShowCursor(true);
                timeoutRef.current = setTimeout(() => {
                    setCurrentText(currentPhrase.slice(0, currentText.length + 1));
                }, typingSpeed);
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, delayAfterType, delayAfterDelete]);

    return (
        <span className={styles.typewriterContainer}>
            {currentText}
            {showCursor && <span className={styles.cursor}></span>}
        </span>
    );
};

export default TypewriterEffect;

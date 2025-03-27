import { Example } from "./Example";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import styles from "./Example.module.css";
import chatStyles from "../../pages/chat/Chat.module.css";

interface Props {
    onExampleClicked: (value: string) => void;
    useGPT4V?: boolean;
}

export const ExampleList = ({ onExampleClicked, useGPT4V }: Props) => {
    const { t } = useTranslation();

    // Full questions for sending to the API
    const DEFAULT_EXAMPLES: string[] = [t("defaultExamples.1"), t("defaultExamples.2"), t("defaultExamples.3")];
    const GPT4V_EXAMPLES: string[] = [t("gpt4vExamples.1"), t("gpt4vExamples.2"), t("gpt4vExamples.3")];

    // Short phrases for display
    const DEFAULT_PHRASES: string[] = ["COPD Sauerstofftherapie", "Therapie bei Vorhofflimmern", "Diagnostik Lungenfibrose"];
    const GPT4V_PHRASES: string[] = ["GPT4V Beispiel 1", "GPT4V Beispiel 2", "GPT4V Beispiel 3"];

    const examples = useGPT4V ? GPT4V_EXAMPLES : DEFAULT_EXAMPLES;
    const phrases = useGPT4V ? GPT4V_PHRASES : DEFAULT_PHRASES;

    return (
        <div className={styles.examplesBoxContainer}>
            {examples.map((question, i) => (
                <Example
                    key={i}
                    text={phrases[i]}
                    value={question}
                    onClick={value => {
                        onExampleClicked(value);
                    }}
                />
            ))}
        </div>
    );
};

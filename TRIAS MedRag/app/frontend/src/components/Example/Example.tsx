import styles from "./Example.module.css";
import { useContext } from "react";
import { LoginContext } from "../../loginContext";
import { requireLogin } from "../../authConfig";

interface Props {
    text: string;
    value: string;
    onClick: (value: string) => void;
}

export const Example = ({ text, value, onClick }: Props) => {
    const { loggedIn } = useContext(LoginContext);
    const disableRequiredAccessControl = requireLogin && !loggedIn;

    const handleClick = () => {
        if (!disableRequiredAccessControl) {
            onClick(value);
        }
    };

    return (
        <div className={`${styles.example} ${disableRequiredAccessControl ? styles.disabled : ""}`} onClick={handleClick}>
            <p className={styles.exampleText}>{text}</p>
            <span className={styles.arrowIcon}>↗</span>
        </div>
    );
};

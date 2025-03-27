import { Button } from "@fluentui/react-components";

export default function CategoryButtons(props: { onDocumentSourceChange?: (source: string) => void; documentSource?: string }) {
    return (
        <div className={"flex"}>
            <Button className={``} onClick={() => props.onDocumentSourceChange && props.onDocumentSourceChange("multifiltrate")}>
                Anleitungen
            </Button>
            <Button className={""} onClick={() => props.onDocumentSourceChange && props.onDocumentSourceChange("leitlinien")}>
                Leitlinien
            </Button>
            <Button className={""} onClick={() => props.onDocumentSourceChange && props.onDocumentSourceChange("web")}>
                Web
            </Button>
        </div>
    );
}

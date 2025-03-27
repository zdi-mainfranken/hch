import { Stack, Pivot, PivotItem, Spinner } from "@fluentui/react";
import { useTranslation } from "react-i18next";
import styles from "./AnalysisPanel.module.css";

import { SupportingContent } from "../SupportingContent";
import { ChatAppResponse } from "../../api";
import { AnalysisPanelTabs } from "./AnalysisPanelTabs";
import { MarkdownViewer } from "../MarkdownViewer";
import { useMsal } from "@azure/msal-react";
import { getHeaders } from "../../api";
import { useLogin, getToken } from "../../authConfig";
import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// PDF Renderer inline component
const PdfRendererCanvas = ({ pdfData, initialPage = 1 }: { pdfData: Uint8Array; initialPage: number }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const renderPdf = async () => {
            if (!containerRef.current) return;

            try {
                setIsLoading(true);
                containerRef.current.innerHTML = ""; // Clear previous content

                // Load the PDF document
                const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                const pdf = await loadingTask.promise;

                // Create canvas elements for each page
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });

                    const wrapper = document.createElement("div");
                    wrapper.className = styles.pageWrapper;

                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    canvas.className = styles.pdfPageCanvas;

                    wrapper.appendChild(canvas);
                    containerRef.current.appendChild(wrapper);

                    await page.render({
                        canvasContext: context!,
                        viewport: viewport
                    }).promise;
                }

                setIsLoading(false);

                // Scroll to initial page if specified
                if (initialPage > 1 && initialPage <= pdf.numPages && containerRef.current) {
                    const pageElement = containerRef.current.children[initialPage - 1] as HTMLElement;
                    if (pageElement) {
                        setTimeout(() => {
                            containerRef.current?.scrollTo({
                                top: pageElement.offsetTop - 20,
                                behavior: "smooth"
                            });
                        }, 100);
                    }
                }
            } catch (error) {
                console.error("Error rendering PDF:", error);
                setIsLoading(false);
            }
        };

        renderPdf();
    }, [pdfData, initialPage]);

    return (
        <div className={styles.pdfRenderer} ref={containerRef}>
            {isLoading && (
                <div className={styles.pdfLoadingOverlay}>
                    <Spinner label="Rendering PDF..." />
                </div>
            )}
        </div>
    );
};

interface Props {
    className: string;
    activeTab: AnalysisPanelTabs;
    onActiveTabChanged: (tab: AnalysisPanelTabs) => void;
    activeCitation: string | undefined;
    citationHeight: string;
    answer: ChatAppResponse;
}

const pivotItemDisabledStyle = { disabled: true, style: { color: "grey" } };

export const AnalysisPanel = ({ answer, activeTab, activeCitation, citationHeight, className, onActiveTabChanged }: Props) => {
    const isDisabledSupportingContentTab: boolean = !answer.context.data_points;
    const isDisabledCitationTab: boolean = !activeCitation;
    const [citation, setCitation] = useState("");
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [initialPage, setInitialPage] = useState(1);

    const client = useLogin ? useMsal().instance : undefined;
    const { t } = useTranslation();

    const fetchCitation = async () => {
        if (!activeCitation) return;

        const token = client ? await getToken(client) : undefined;

        // Get hash from the URL as it may contain #page=N
        const originalHash = activeCitation.indexOf("#") >= 0 ? activeCitation.split("#")[1] : "";
        // Extract page number if present
        if (originalHash && originalHash.startsWith("page=")) {
            setInitialPage(parseInt(originalHash.replace("page=", ""), 10));
        }

        const response = await fetch(activeCitation.split("#")[0], {
            method: "GET",
            headers: await getHeaders(token)
        });

        const citationContent = await response.blob();

        // For PDFs, we need to handle them differently for react-pdf
        if (activeCitation.toLowerCase().endsWith(".pdf")) {
            const arrayBuffer = await citationContent.arrayBuffer();
            setPdfData(new Uint8Array(arrayBuffer));
        } else {
            // For other files, use the old method
            let citationObjectUrl = URL.createObjectURL(citationContent);
            // Add hash back to the new blob URL
            if (originalHash) {
                citationObjectUrl += "#" + originalHash;
            }
            setCitation(citationObjectUrl);
        }
    };

    useEffect(() => {
        setPdfData(null);
        setNumPages(null);
        setInitialPage(1);
        fetchCitation();

        return () => {
            // Clean up object URL when component unmounts
            if (citation) {
                URL.revokeObjectURL(citation);
            }
        };
    }, [activeCitation]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const renderFileViewer = () => {
        if (!activeCitation) {
            return null;
        }

        const fileExtension = activeCitation.split(".").pop()?.toLowerCase();
        switch (fileExtension) {
            case "png":
                return <img src={citation} className={styles.citationImg} alt="Citation Image" />;
            case "md":
                return <MarkdownViewer src={activeCitation} />;
            case "pdf":
                return (
                    <div className={styles.pdfContainer} style={{ height: citationHeight }}>
                        {pdfData ? (
                            <PdfRendererCanvas pdfData={pdfData} initialPage={initialPage} />
                        ) : (
                            <div className={styles.pdfLoading}>
                                <Spinner label="Loading PDF..." />
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className={styles.citationContainer}>
                        <iframe title="Citation" src={citation} width="100%" height={citationHeight} className={styles.citationIframe} />
                    </div>
                );
        }
    };

    return (
        <Pivot
            className={className}
            selectedKey={activeTab}
            onLinkClick={pivotItem => pivotItem && onActiveTabChanged(pivotItem.props.itemKey! as AnalysisPanelTabs)}
        >
            <PivotItem
                itemKey={AnalysisPanelTabs.SupportingContentTab}
                headerText={t("headerTexts.supportingContent")}
                headerButtonProps={isDisabledSupportingContentTab ? pivotItemDisabledStyle : undefined}
            >
                <SupportingContent supportingContent={answer.context.data_points} />
            </PivotItem>
            <PivotItem
                itemKey={AnalysisPanelTabs.CitationTab}
                headerText={t("headerTexts.citation")}
                headerButtonProps={isDisabledCitationTab ? pivotItemDisabledStyle : undefined}
            >
                {renderFileViewer()}
            </PivotItem>
        </Pivot>
    );
};

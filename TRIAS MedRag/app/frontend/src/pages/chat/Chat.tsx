import { useRef, useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Panel, DefaultButton, Stack, Label, ChoiceGroup } from "@fluentui/react";
import { SparkleFilled } from "@fluentui/react-icons";
import img from "../../assets/img.png";
import chariteLogo from "../../assets/CharitéLogo.png";
import awmfLogo from "../../assets/1.png";
import baekLogo from "../../assets/2.png";
import kbvLogo from "../../assets/3.png";

import readNDJSONStream from "ndjson-readablestream";

import styles from "./Chat.module.css";

import {
    chatApi,
    configApi,
    RetrievalMode,
    ChatAppResponse,
    ChatAppResponseOrError,
    ChatAppRequest,
    ResponseMessage,
    VectorFieldOptions,
    GPT4VInput
} from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { HistoryPanel } from "../../components/HistoryPanel";
import { HistoryProviderOptions, useHistoryManager } from "../../components/HistoryProviders";
import { HistoryButton } from "../../components/HistoryButton";
import { SettingsButton } from "../../components/SettingsButton";
import { ClearChatButton } from "../../components/ClearChatButton";
import { useLogin, requireAccessControl } from "../../authConfig";
import { TokenClaimsDisplay } from "../../components/TokenClaimsDisplay";
import { LoginContext } from "../../loginContext";
import { LanguagePicker } from "../../i18n/LanguagePicker";
import { Settings } from "../../components/Settings/Settings";
import TypewriterEffect from "../../components/TypewriterEffect";
import { LayoutContext } from "../layout/Layout";

const Chat = () => {
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState<boolean>(false);
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [temperature, setTemperature] = useState<number>(0.1);
    const [seed, setSeed] = useState<number | null>(null);
    const [minimumRerankerScore, setMinimumRerankerScore] = useState<number>(0);
    const [minimumSearchScore, setMinimumSearchScore] = useState<number>(0);
    const [retrieveCount, setRetrieveCount] = useState<number>(3);
    const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>(RetrievalMode.Hybrid);
    const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
    const [shouldStream, setShouldStream] = useState<boolean>(true);
    const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
    const [includeCategory, setIncludeCategory] = useState<string>("");
    const [excludeCategory, setExcludeCategory] = useState<string>("");
    const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(true);
    const [vectorFieldList, setVectorFieldList] = useState<VectorFieldOptions[]>([VectorFieldOptions.Embedding]);
    const [useOidSecurityFilter, setUseOidSecurityFilter] = useState<boolean>(false);
    const [useGroupsSecurityFilter, setUseGroupsSecurityFilter] = useState<boolean>(false);
    const [gpt4vInput, setGPT4VInput] = useState<GPT4VInput>(GPT4VInput.TextAndImages);
    const [useGPT4V, setUseGPT4V] = useState<boolean>(false);
    const [documentSource, setDocumentSource] = useState("all");

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
    const inputContainerRef = useRef<HTMLDivElement>(null);
    const disclaimerRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[user: string, response: ChatAppResponse][]>([]);
    const [streamedAnswers, setStreamedAnswers] = useState<[user: string, response: ChatAppResponse][]>([]);

    const [showGPT4VOptions, setShowGPT4VOptions] = useState<boolean>(false);
    const [showSemanticRankerOption, setShowSemanticRankerOption] = useState<boolean>(false);
    const [showVectorOption, setShowVectorOption] = useState<boolean>(false);
    const [showLanguagePicker, setshowLanguagePicker] = useState<boolean>(false);
    const [showChatHistoryBrowser, setShowChatHistoryBrowser] = useState<boolean>(false);
    const [showChatHistoryCosmos, setShowChatHistoryCosmos] = useState<boolean>(false);

    const [isUploadPanelOpen, setIsUploadPanelOpen] = useState<boolean>(false);

    const getConfig = async () => {
        configApi().then(config => {
            setShowGPT4VOptions(config.showGPT4VOptions);
            setUseSemanticRanker(config.showSemanticRankerOption);
            setShowSemanticRankerOption(config.showSemanticRankerOption);
            setShowVectorOption(config.showVectorOption);
            if (!config.showVectorOption) {
                setRetrievalMode(RetrievalMode.Text);
            }
            setshowLanguagePicker(config.showLanguagePicker);
            setShowChatHistoryBrowser(config.showChatHistoryBrowser);
            setShowChatHistoryCosmos(config.showChatHistoryCosmos);
        });
    };

    const handleAsyncRequest = async (question: string, answers: [string, ChatAppResponse][], responseBody: ReadableStream<any>) => {
        let answer: string = "";
        let askResponse: ChatAppResponse = {} as ChatAppResponse;

        const updateState = (newContent: string) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    answer += newContent;
                    const latestResponse: ChatAppResponse = {
                        ...askResponse,
                        message: { content: answer, role: askResponse.message.role }
                    };
                    setStreamedAnswers([...answers, [question, latestResponse]]);
                    resolve(null);
                }, 33);
            });
        };
        try {
            setIsStreaming(true);
            for await (const event of readNDJSONStream(responseBody)) {
                if (event["context"] && event["context"]["data_points"]) {
                    event["message"] = event["delta"];
                    askResponse = event as ChatAppResponse;
                } else if (event["delta"] && event["delta"]["content"]) {
                    setIsLoading(false);
                    await updateState(event["delta"]["content"]);
                } else if (event["context"]) {
                    // Update context with new keys from latest event
                    askResponse.context = { ...askResponse.context, ...event["context"] };
                } else if (event["error"]) {
                    throw Error(event["error"]);
                }
            }
        } finally {
            setIsStreaming(false);
        }
        const fullResponse: ChatAppResponse = {
            ...askResponse,
            message: { content: answer, role: askResponse.message.role }
        };
        return fullResponse;
    };

    const { loggedIn } = useContext(LoginContext);

    const historyProvider: HistoryProviderOptions = (() => {
        if (useLogin && showChatHistoryCosmos && loggedIn) return HistoryProviderOptions.CosmosDB;
        if (showChatHistoryBrowser) return HistoryProviderOptions.IndexedDB;
        return HistoryProviderOptions.None;
    })();
    const historyManager = useHistoryManager(historyProvider);

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        error && setError(undefined);
        setIsLoading(true);

        try {
            const messages: ResponseMessage[] = answers.flatMap(a => [
                { content: a[0], role: "user" },
                { content: a[1].message.content, role: "assistant" }
            ]);

            const request: ChatAppRequest = {
                messages: [...messages, { content: question, role: "user" }],
                context: {
                    overrides: {
                        prompt_template: promptTemplate.length === 0 ? undefined : promptTemplate,
                        include_category: includeCategory.length === 0 ? undefined : includeCategory,
                        exclude_category: excludeCategory.length === 0 ? undefined : excludeCategory,
                        top: retrieveCount,
                        temperature: temperature,
                        minimum_reranker_score: minimumRerankerScore,
                        minimum_search_score: minimumSearchScore,
                        retrieval_mode: retrievalMode,
                        semantic_ranker: useSemanticRanker,
                        semantic_captions: useSemanticCaptions,
                        suggest_followup_questions: useSuggestFollowupQuestions,
                        use_oid_security_filter: useOidSecurityFilter,
                        use_groups_security_filter: useGroupsSecurityFilter,
                        vector_fields: vectorFieldList,
                        use_gpt4v: useGPT4V,
                        gpt4v_input: gpt4vInput,
                        language: i18n.language,
                        ...(seed !== null ? { seed: seed } : {})
                    }
                },
                // AI Chat Protocol: Client must pass on any session state received from the server
                session_state: answers.length ? answers[answers.length - 1][1].session_state : null
            };

            const response = await chatApi(request, shouldStream, undefined);
            if (!response.body) {
                throw Error("No response body");
            }
            if (response.status > 299 || !response.ok) {
                throw Error(`Request failed with status ${response.status}`);
            }
            if (shouldStream) {
                const parsedResponse: ChatAppResponse = await handleAsyncRequest(question, answers, response.body);
                setAnswers([...answers, [question, parsedResponse]]);

                // If analysis panel is open, update the selected answer to the newest one
                if (activeAnalysisPanelTab) {
                    setSelectedAnswer(answers.length);
                }

                if (typeof parsedResponse.session_state === "string" && parsedResponse.session_state !== "") {
                    historyManager.addItem(parsedResponse.session_state, [...answers, [question, parsedResponse]], undefined);
                }
            } else {
                const parsedResponse: ChatAppResponseOrError = await response.json();
                if (parsedResponse.error) {
                    throw Error(parsedResponse.error);
                }
                setAnswers([...answers, [question, parsedResponse as ChatAppResponse]]);

                // If analysis panel is open, update the selected answer to the newest one
                if (activeAnalysisPanelTab) {
                    setSelectedAnswer(answers.length);
                }
                if (typeof parsedResponse.session_state === "string" && parsedResponse.session_state !== "") {
                    historyManager.addItem(parsedResponse.session_state, [...answers, [question, parsedResponse as ChatAppResponse]], undefined);
                }
            }
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setAnswers([]);
        lastQuestionRef.current = "";
        setActiveAnalysisPanelTab(undefined);
        setActiveCitation(undefined);

        // Trigger resize to update disclaimer
        setTimeout(() => {
            const resizeEvent = new Event("resize");
            window.dispatchEvent(resizeEvent);
        }, 100);
    };

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading]);
    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "auto" }), [streamedAnswers]);
    useEffect(() => {
        getConfig();
    }, []);

    const handleSettingsChange = (field: string, value: any) => {
        switch (field) {
            case "promptTemplate":
                setPromptTemplate(value);
                break;
            case "temperature":
                setTemperature(value);
                break;
            case "seed":
                setSeed(value);
                break;
            case "minimumRerankerScore":
                setMinimumRerankerScore(value);
                break;
            case "minimumSearchScore":
                setMinimumSearchScore(value);
                break;
            case "retrieveCount":
                setRetrieveCount(value);
                break;
            case "useSemanticRanker":
                setUseSemanticRanker(value);
                break;
            case "useSemanticCaptions":
                setUseSemanticCaptions(value);
                break;
            case "excludeCategory":
                setExcludeCategory(value);
                break;
            case "includeCategory":
                setIncludeCategory(value);
                break;
            case "useOidSecurityFilter":
                setUseOidSecurityFilter(value);
                break;
            case "useGroupsSecurityFilter":
                setUseGroupsSecurityFilter(value);
                break;
            case "shouldStream":
                setShouldStream(value);
                break;
            case "useSuggestFollowupQuestions":
                setUseSuggestFollowupQuestions(value);
                break;
            case "useGPT4V":
                setUseGPT4V(value);
                break;
            case "gpt4vInput":
                setGPT4VInput(value);
                break;
            case "vectorFieldList":
                setVectorFieldList(value);
                break;
            case "retrievalMode":
                setRetrievalMode(value);
                break;
        }
    };

    const onExampleClicked = (example: string) => {
        makeApiRequest(example);
    };

    const onShowCitation = (citation: string, index: number) => {
        if (activeCitation === citation && activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveCitation(citation);
            setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
        }

        setSelectedAnswer(index);
    };

    const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
        if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }

        setSelectedAnswer(index);
    };

    const { t, i18n } = useTranslation();

    // Get the context
    const { setClearChatFunction, setOpenSettingsFunction } = useContext(LayoutContext);

    // Register the functions with the Layout component
    useEffect(() => {
        // Register the functions when the component mounts
        if (setClearChatFunction) {
            setClearChatFunction(() => clearChat);
        }

        if (setOpenSettingsFunction) {
            setOpenSettingsFunction(() => () => setIsConfigPanelOpen(true));
        }

        // Cleanup when unmounting
        return () => {
            if (setClearChatFunction) setClearChatFunction(() => {});
            if (setOpenSettingsFunction) setOpenSettingsFunction(() => {});
        };
    }, [setClearChatFunction, setOpenSettingsFunction]); // Don't include clearChat in dependencies

    useEffect(() => {
        const resizeDisclaimerText = () => {
            if (!disclaimerRef.current || !inputContainerRef.current) return;

            const disclaimer = disclaimerRef.current;
            const inputWidth = inputContainerRef.current.offsetWidth;

            // Reset font size to start fresh
            disclaimer.style.fontSize = "0.7rem";
            disclaimer.style.maxHeight = "none";

            // Calculate original height when not constrained
            const originalHeight = disclaimer.scrollHeight;

            // Target height for two lines (approximate line height)
            const lineHeight = parseFloat(getComputedStyle(disclaimer).lineHeight);
            const targetHeight = lineHeight * 2;

            // If content is already shorter than two lines, we're done
            if (originalHeight <= targetHeight) return;

            // Gradually reduce font size until text fits in two lines
            let fontSize = 0.7;
            const minFontSize = 0.5;
            const step = 0.01;

            while (disclaimer.scrollHeight > targetHeight && fontSize > minFontSize) {
                fontSize -= step;
                disclaimer.style.fontSize = `${fontSize}rem`;
            }

            // Set max height to ensure it's exactly two lines
            disclaimer.style.maxHeight = `${targetHeight}px`;

            // Update width to match input container
            disclaimer.style.width = `${inputWidth}px`;
        };

        // Call initially and on window resize
        resizeDisclaimerText();
        window.addEventListener("resize", resizeDisclaimerText);

        return () => window.removeEventListener("resize", resizeDisclaimerText);
    }, [activeAnalysisPanelTab]);

    // Add this effect to recalculate when analysis panel changes
    useEffect(() => {
        // Small delay to ensure DOM updates
        const timer = setTimeout(() => {
            const resizeEvent = new Event("resize");
            window.dispatchEvent(resizeEvent);
        }, 100);

        return () => clearTimeout(timer);
    }, [activeAnalysisPanelTab]);

    useEffect(() => {
        if (documentSource === "multifiltrate") {
            setIncludeCategory("MultiFiltratePro-Anleitung");
        } else {
            setIncludeCategory("");
        }
    }, [documentSource]);

    return (
        <div className={styles.container}>
            <Helmet>
                <title>{t("pageTitle")}</title>
            </Helmet>

            {((useLogin && showChatHistoryCosmos) || showChatHistoryBrowser) && (
                <div className={styles.historyButtonContainer}>
                    <HistoryButton onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)} />
                </div>
            )}

            <div className={styles.chatRoot} style={{ marginLeft: isHistoryPanelOpen ? "100px" : "0" }}>
                <div className={styles.chatContainer}>
                    {!lastQuestionRef.current ? (
                        <>
                            <div className={styles.headerInputContainer}>
                                {/* <h1 className={styles.companyName}>TRIAS</h1> */}
                                <h1 className={styles.mainHeader}>
                                    <span className={styles.unifiedGradient}>
                                        Ihr medizinischer{" "}
                                        <TypewriterEffect
                                            phrases={[
                                                "Leitlinien-Experte",
                                                "Arztbrief-Assistent",
                                                "Diagnosen-Spezialist",
                                                "Forschungs-Mitarbeiter",
                                                "Praxis-Berater"
                                            ]}
                                        />
                                    </span>
                                </h1>

                                {/* Temporarily hiding the subtitle 
                                <h2 className={styles.subHeader}>{t("chatEmptyStateSubtitle")}</h2>
                                */}

                                <div className={styles.inputContainer}>
                                    <QuestionInput
                                        clearOnSend
                                        placeholder={t("defaultExamples.placeholder")}
                                        disabled={isLoading}
                                        onSend={question => makeApiRequest(question)}
                                        showDocumentSourceToggle={true}
                                        documentSource={documentSource}
                                        onDocumentSourceChange={source => setDocumentSource(source)}
                                    />
                                </div>
                            </div>

                            <div className={styles.examplesContainer}>
                                <div className={styles.examplesWrapper}>
                                    {showLanguagePicker && <LanguagePicker onLanguageChange={newLang => i18n.changeLanguage(newLang)} />}
                                    <ExampleList onExampleClicked={onExampleClicked} useGPT4V={useGPT4V} />
                                </div>
                            </div>

                            {/* Add the logos container below the examples */}
                            <div className={styles.logosContainer}>
                                <div className={styles.logosWrapper}>
                                    <img src={awmfLogo} alt="AWMF Logo" className={styles.partnerLogo} />
                                    <img src={baekLogo} alt="Bundesärztekammer Logo" className={styles.partnerLogo} />
                                    <img src={kbvLogo} alt="KBV Logo" className={styles.partnerLogo} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.chatMessageStream}>
                                {isStreaming &&
                                    streamedAnswers.map((streamedAnswer, index) => (
                                        <div key={index}>
                                            <UserChatMessage message={streamedAnswer[0]} />
                                            <div className={styles.chatMessageGpt}>
                                                <Answer
                                                    isStreaming={true}
                                                    key={index}
                                                    answer={streamedAnswer[1]}
                                                    index={index}
                                                    isSelected={false}
                                                    onCitationClicked={c => onShowCitation(c, index)}
                                                    onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                                    onFollowupQuestionClicked={q => makeApiRequest(q)}
                                                    showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                {!isStreaming &&
                                    answers.map((answer, index) => (
                                        <div key={index}>
                                            <UserChatMessage message={answer[0]} />
                                            <div className={styles.chatMessageGpt}>
                                                <Answer
                                                    isStreaming={false}
                                                    key={index}
                                                    answer={answer[1]}
                                                    index={index}
                                                    isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                                                    onCitationClicked={c => onShowCitation(c, index)}
                                                    onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                                    onFollowupQuestionClicked={q => makeApiRequest(q)}
                                                    showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                {isLoading && (
                                    <>
                                        <UserChatMessage message={lastQuestionRef.current} />
                                        <div className={styles.chatMessageGptMinWidth}>
                                            <AnswerLoading />
                                        </div>
                                    </>
                                )}
                                {error ? (
                                    <>
                                        <UserChatMessage message={lastQuestionRef.current} />
                                        <div className={styles.chatMessageGptMinWidth}>
                                            <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionRef.current)} />
                                        </div>
                                    </>
                                ) : null}
                                <div ref={chatMessageStreamEnd} />
                            </div>

                            <div
                                ref={inputContainerRef}
                                className={styles.chatInput}
                                style={{
                                    width: activeAnalysisPanelTab ? "46%" : "100%",
                                    left: activeAnalysisPanelTab ? "25%" : "50%",
                                    marginBottom: "40px"
                                }}
                            >
                                <QuestionInput
                                    clearOnSend
                                    placeholder={t("defaultExamples.placeholder")}
                                    disabled={isLoading}
                                    onSend={question => makeApiRequest(question)}
                                />
                            </div>

                            {lastQuestionRef.current && (
                                <div
                                    ref={disclaimerRef}
                                    className={styles.disclaimerText}
                                    style={{
                                        position: "fixed",
                                        bottom: "22px",
                                        width: activeAnalysisPanelTab ? "46%" : "100%",
                                        maxWidth: "750px",
                                        left: activeAnalysisPanelTab ? "25%" : "50%",
                                        transform: "translateX(-50%)",
                                        textAlign: "center",
                                        padding: "0 20px",
                                        fontSize: "0.7rem",
                                        lineHeight: "1.5",
                                        zIndex: 10,
                                        overflow: "hidden"
                                    }}
                                >
                                    <span>
                                        Entwickelt vom Fächerverbund Infektiologie, Pneumologie und Intensivmedizin der Charité für Forschungszwecke. Dieses
                                        Programm erfüllt NICHT die Anforderungen an Datenschutz und medizinische Software. Wir übernehmen keine Haftung für
                                        Inhalte oder daraus entstandene Schäden.
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {answers.length > 0 && activeAnalysisPanelTab && (
                    <AnalysisPanel
                        className={styles.chatAnalysisPanel}
                        activeCitation={activeCitation}
                        onActiveTabChanged={x => onToggleTab(x, selectedAnswer)}
                        citationHeight="810px"
                        answer={answers[selectedAnswer][1]}
                        activeTab={activeAnalysisPanelTab}
                    />
                )}

                {((useLogin && showChatHistoryCosmos) || showChatHistoryBrowser) && (
                    <HistoryPanel
                        provider={historyProvider}
                        isOpen={isHistoryPanelOpen}
                        notify={!isStreaming && !isLoading}
                        onClose={() => setIsHistoryPanelOpen(false)}
                        onChatSelected={answers => {
                            if (answers.length === 0) return;
                            setAnswers(answers);
                            lastQuestionRef.current = answers[answers.length - 1][0];
                        }}
                    />
                )}

                <Panel
                    headerText={t("labels.headerText")}
                    isOpen={isConfigPanelOpen}
                    isBlocking={false}
                    onDismiss={() => setIsConfigPanelOpen(false)}
                    closeButtonAriaLabel={t("labels.closeButton")}
                    onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>{t("labels.closeButton")}</DefaultButton>}
                    isFooterAtBottom={true}
                >
                    <Settings
                        promptTemplate={promptTemplate}
                        temperature={temperature}
                        retrieveCount={retrieveCount}
                        seed={seed}
                        minimumSearchScore={minimumSearchScore}
                        minimumRerankerScore={minimumRerankerScore}
                        useSemanticRanker={useSemanticRanker}
                        useSemanticCaptions={useSemanticCaptions}
                        excludeCategory={excludeCategory}
                        includeCategory={includeCategory}
                        retrievalMode={retrievalMode}
                        useGPT4V={useGPT4V}
                        gpt4vInput={gpt4vInput}
                        vectorFieldList={vectorFieldList}
                        showSemanticRankerOption={showSemanticRankerOption}
                        showGPT4VOptions={showGPT4VOptions}
                        showVectorOption={showVectorOption}
                        useOidSecurityFilter={useOidSecurityFilter}
                        useGroupsSecurityFilter={useGroupsSecurityFilter}
                        useLogin={!!useLogin}
                        loggedIn={loggedIn}
                        requireAccessControl={requireAccessControl}
                        shouldStream={shouldStream}
                        useSuggestFollowupQuestions={useSuggestFollowupQuestions}
                        showSuggestFollowupQuestions={true}
                        onChange={handleSettingsChange}
                    />
                    {useLogin && <TokenClaimsDisplay />}
                </Panel>
            </div>
        </div>
    );
};

export default Chat;

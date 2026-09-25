import styled from "@emotion/styled";
import { useAppSelector } from "@hooks/store";
import { KeyboardArrowLeft, KeyboardArrowRight, ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
  Stack,
  Typography,
  Collapse,
} from "@mui/material";
import { selectDiscoverStep } from "@store/slices/table/table.selectors";
import {
  FC,
  useState,
  FunctionComponent,
  useEffect,
  useMemo,
} from "react";
import {
  selectModifiersAsArray,
  selectReconciliatorsAsArray,
  selectExtendersAsArray,
  selectComplianceAsArray,
} from "@store/slices/config/config.selectors";
import compliance from "../../../assets/compliance.gif";

const IndexButton = styled(Button, { shouldForwardProp: (prop) =>
    prop !== 'active' })(({ active }: { active?: boolean }) => ({
  textTransform: "none",
  justifyContent: "flex-start",
  fontWeight: active ? "bold" : "normal",
  backgroundColor: active ? "rgba(0, 0, 0, 0.04)" : "transparent",
  textAlign: "left",
  alignItems: "flex-start",
  whiteSpace: "normal",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

const List = styled.ul({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  listStyle: "disc",
});

const ListItemButton = styled(Button, { shouldForwardProp: (prop) =>
    prop !== 'active' })(({ active }: { active?: boolean }) => ({
  textTransform: "none",
  fontWeight: active ? "bold" : "normal",
  backgroundColor: active ? "rgba(0, 0, 0, 0.04)" : "transparent",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%"
}));

const IndexContainer = styled(Box)({
  padding: "16px",
  borderRight: "1px solid rgba(0, 0, 0, 0.12)",
  height: "auto",
  minWidth: "260px",
  overflowY: "auto",
}) as typeof Box;

const ContentContainer = styled(Box)({
  padding: "16px",
  height: "auto",
  width: "100%",
  overflow: "auto",
}) as typeof Box;

const ROOT_KEY = "__root" as const;

type Step = {
  label: string;
  Description: FunctionComponent<{ goTo: (step: number) => void }>;
};

type NestedData = Record<string, Record<string, any[]>>;

const SOURCES = [
  { key: "Modification", selector: selectModifiersAsArray },
  { key: "Reconciliation", selector: selectReconciliatorsAsArray },
  { key: "Extension", selector: selectExtendersAsArray },
  { key: "Gen AI", selector: () => [] },
  { key: "Compliance", selector: selectComplianceAsArray },
];

const getGroup = (s: any) => s?.public?.group ?? s?.group;
const isGenAI = (s: any) => getGroup(s) === "Gen AI";

const deduplicateById = (services: any[]) => {
  const seen = new Set();
  return services.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
};

const splitName = (rawName: string) => {
  const parts = (rawName || "").split(":").map((x) => x.trim());
  const rawCategory = parts.length > 1 ? parts[0] : "";
  const titleAfterColon = parts.length > 1 ? parts.slice(1).join(": ") : "";
  return { rawCategory, titleAfterColon };
};

const DiscoverIndex: FC<{
  activeStep: number;
  onStepSelect: (step: number) => void;
  nestedData: NestedData;
  chapters: Array<{ chapterNumber: number; key: string }>;
}> = ({ activeStep, onStepSelect, nestedData, chapters }) => {
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const toggleChapter = (key: string) => {
    setOpenChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCategory = (categoryKey: string) => {
    setOpenCategories((prev) => ({ ...prev, [categoryKey]: !prev[categoryKey] }));
  };

  useEffect(() => {
    chapters.forEach((ch) => {
      const categories = nestedData[ch.key] || {};
      const rootItems = categories[ROOT_KEY] || [];

      if (rootItems.some((s) => s.stepIndex === activeStep)) {
        setOpenChapters((prev) => ({ ...prev, [ch.key]: true }));
        return;
      }

      Object.keys(categories)
        .filter((c) => c !== ROOT_KEY)
        .forEach((category) => {
          const services = categories[category] || [];
          if (services.some((s) => s.stepIndex === activeStep)) {
            setOpenChapters((prev) => ({ ...prev, [ch.key]: true }));
            setOpenCategories((prev) => ({ ...prev, [`${ch.key}::${category}`]: true }));
          }
        });
    });
  }, [activeStep, chapters, nestedData]);

  return (
    <IndexContainer>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Discover Services
      </Typography>
      <Stack spacing={1}>
        <IndexButton active={activeStep === 1} onClick={() => onStepSelect(1)}>
          1. Introduction
        </IndexButton>

        {chapters.map((ch) => {
          const categories = nestedData[ch.key] || {};
          const rootItems = categories[ROOT_KEY] || [];
          const categoryNames = Object.keys(categories).filter((c) => c !== ROOT_KEY);

          const isAnyChildActive =
            rootItems.some((s) => s.stepIndex === activeStep) ||
            categoryNames.some((cat) => (categories[cat] || []).some((s) => s.stepIndex === activeStep));

          const isOpen = openChapters[ch.key] || false;

          return (
            <Stack key={ch.key} spacing={1}>
              <ListItemButton
                onClick={() => toggleChapter(ch.key)}
                sx={{ fontWeight: isAnyChildActive ? "bold" : "normal" }}
              >
                <Typography variant="body2">
                  {`${ch.chapterNumber}. ${ch.key}`}
                </Typography>
                {isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </ListItemButton>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Stack spacing={1} sx={{ ml: 2, mt: 0.5, borderLeft: "1px solid rgba(0,0,0,0.08)" }}>
                  {rootItems.map((item, idx) => (
                    <IndexButton
                      key={item.id}
                      active={activeStep === item.stepIndex}
                      onClick={() => onStepSelect(item.stepIndex)}
                    >
                      {`${ch.chapterNumber}.${idx + 1} ${item.title}`}
                    </IndexButton>
                  ))}
                  {categoryNames.map((category, catIdx) => {
                    const services = categories[category] || [];
                    const number = rootItems.length + catIdx + 1;
                    const categoryKey = `${ch.key}::${category}`;
                    const isCategoryOpen = openCategories[categoryKey] || false;
                    const isSingleItem = services.length === 1;
                    const isCategoryActive = services.some((s) => s.stepIndex === activeStep);
                    const forceAccordion = ch.key === "Gen AI";

                    if (isSingleItem && !forceAccordion) {
                      const item = services[0];
                      return (
                        <IndexButton
                          key={item.id}
                          active={activeStep === item.stepIndex}
                          onClick={() => onStepSelect(item.stepIndex)}
                        >
                          {`${ch.chapterNumber}.${number} ${item.title}`}
                        </IndexButton>
                      );
                    }

                    return (
                      <Box key={categoryKey} spacing={1}>
                        <ListItemButton
                          onClick={() => toggleCategory(categoryKey)}
                          sx={{ fontWeight: isCategoryActive ? "bold" : "normal" }}
                        >
                          <Typography variant="body2">
                            {`${ch.chapterNumber}.${number} ${category}`}
                          </Typography>
                          {isCategoryOpen ? (
                            <ExpandLess fontSize="small" />
                          ) : (
                            <ExpandMore fontSize="small" />
                          )}
                        </ListItemButton>

                        <Collapse in={isCategoryOpen} timeout="auto" unmountOnExit>
                          <Stack spacing={1} sx={{ ml: 2, mt: 0.5, borderLeft: '1px solid rgba(0,0,0,0.08)' }}>
                            {services.map((item, idx) => (
                              <IndexButton
                                key={item.id}
                                sx={{ py: 0.5, fontSize: "0.85rem", pl: 2 }}
                                active={activeStep === item.stepIndex}
                                onClick={() => onStepSelect(item.stepIndex)}
                              >
                                {`${ch.chapterNumber}.${number}.${idx + 1} ${item.title}`}
                              </IndexButton>
                            ))}
                          </Stack>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Stack>
              </Collapse>
            </Stack>
          );
        })}
      </Stack>
    </IndexContainer>
  );
};

const DiscoverStepper: FC<{ onDone: () => void; onBackToWelcome: () => void }> = ({ onDone, onBackToWelcome }) => {
  const discoverStep = useAppSelector(selectDiscoverStep);
  const [activeStep, setActiveStep] = useState(discoverStep);

  const sourceData = SOURCES.map((s) => ({
    key: s.key,
    services: useAppSelector(s.selector) || [],
  }));

  const chapters = useMemo(() => {
    return SOURCES.map((s, i) => ({
      chapterNumber: i + 2,
      key: s.key
    }));
  }, []);

  const { steps, nestedData } = useMemo(() => {
    const data: NestedData = Object.fromEntries(
      SOURCES.map((s) => [s.key, {}])
    ) as NestedData;

    const allSteps: Step[] = [
      {
        label: "Discover Journey",
        Description: () => <Typography>Select a topic from the index on the left.</Typography>,
      },
      {
        label: "Introduction",
        Description: () => (
          <Stack gap="10px">
            <Typography component="div">
              Explore available services for the Modification, Reconciliation, Extension and Compliance.
              <List>
                <li>
                  <b>Modifiers</b>: Responsible for applying transformation function to the column content (e.g.,
                  data cleaning or date formatting).
                </li>
                <li>
                  <b>Reconcilers</b>: Responsible for aligning or enriching tabular data with semantic metadata. They
                  match entities from the dataset with corresponding entries from external or internal knowledge
                  sources,
                  enabling semantic linking and enhanced interoperability.
                </li>
                <li>
                  <b>Extenders</b>: Responsible for adding complementary data or attributes to existing resources, by
                  fetching related information from external systems. They typically operate on columns that have
                  been previously reconciled, enriching them with new metadata or values.
                </li>
                <li>
                  <b>Generative AI </b>: Leverage Large Language Models to perform advanced operations like
                  intelligent data transformation, improved reconciliation, and extraction.
                </li>
                <li>
                  <b>Compliance</b>: Responsible for evaluating data against regulatory frameworks (e.g., GDPR)
                  to ensure processing standards are met.
                </li>
              </List>
            </Typography>
          </Stack>
        ),
      },
    ];

    const processServices = (s: any, macroKey: string) => {
      const rawName = s.name ?? "";
      const {rawCategory, titleAfterColon} = splitName(rawName);

      const targetMacro = isGenAI(s) ? "Gen AI" : macroKey;
      const category = isGenAI(s) ? macroKey : (rawCategory || ROOT_KEY);
      const displayTitle = titleAfterColon || rawName;

      if (!data[targetMacro][category]) data[targetMacro][category] = [];

        const stepIndex = allSteps.length;
        data[targetMacro][category].push({
          ...s,
          title: displayTitle,
          stepIndex,
          originMacro: macroKey,
        });

        allSteps.push({
          label: rawName,
          Description: () => {
            let finalDescription = s.description;

            if (macroKey === "Compliance") {
              finalDescription = finalDescription.replace(
                "PLACEHOLDER_COMPLIANCE_GIF",
                `<img src="${compliance}" alt="GDPR Compliance Check demonstration" style="width:100%; border-radius:7px; margin-top:10px;" />`
              );
            }

            return (
              <Stack gap="10px">
                <Typography dangerouslySetInnerHTML={{ __html: finalDescription }} />
              </Stack>
            );
          },
        });
    };

    SOURCES.forEach(({ key }) => {
      if (key === "Gen AI") {
        sourceData.forEach((d) => {
          deduplicateById(d.services)
            .filter(isGenAI)
            .forEach((s) => processServices(s, d.key));
        });
      } else {
        const currentSource = sourceData.find((d) => d.key === key);
        if (currentSource) {
          deduplicateById(currentSource.services)
            .filter((s) => !isGenAI(s))
            .forEach((s) => processServices(s, key));
        }
      }
    });
    return { steps: allSteps, nestedData: data };
  }, [sourceData]);

  useEffect(() => {
    if (discoverStep > 0 && discoverStep < steps.length) setActiveStep(discoverStep);
  }, [discoverStep, steps.length]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) onDone();
    else setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep === 1) onBackToWelcome();
    else setActiveStep((prev) => Math.max(1, prev - 1));
  };

  const currentStep = steps[activeStep] || steps[0];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "600px" }}>
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <DiscoverIndex
          activeStep={activeStep}
          onStepSelect={setActiveStep}
          nestedData={nestedData}
          chapters={chapters}
        />
        <ContentContainer>
          <Typography variant="h6" mb={2}>{currentStep.label}</Typography>
          <Box><currentStep.Description goTo={setActiveStep} /></Box>
        </ContentContainer>
      </Box>
      <Box
        sx={{
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          p: 2,
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <Button size="small" onClick={handleBack}>
          <KeyboardArrowLeft />
          Back
        </Button>
        <Button size="small" onClick={handleNext}>
          {activeStep === steps.length - 1
            ? ("Done")
            : (
              <>
                Next
                <KeyboardArrowRight />
              </>
            )
          }
        </Button>
      </Box>
    </Box>
  );
};

export default DiscoverStepper;

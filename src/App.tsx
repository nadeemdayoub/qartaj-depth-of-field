import { useState, useMemo } from "react";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Box,
  Flex,
  Text,
  Select,
  Button,
  Radio,
  Stack,
  RadioGroup,
  Icon,
  Wrap,
  WrapItem,
  Divider,
  SimpleGrid,
  Badge,
  IconButton,
  useColorMode,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { TbRuler, TbAperture, TbZoomIn, TbUser } from "react-icons/tb";
import { FiCamera, FiSun, FiMoon, FiHeart } from "react-icons/fi";
import { toImperial, toMetric } from "./utils/units";
import { buildNativeSelectStyles } from "./selectStyles";

import PhotographyGraphic, { SUBJECTS } from "./PhotographyGraphic";
import WelcomeModal from "./WelcomeModal";

import Telephoto from "./assets/100-400.png";
import Fisheye from "./assets/fishey.png";

const CIRCLES_OF_CONFUSION: Record<
  string,
  {
    coc: number;
    sensorHeight: number;
    cropFactor: number;
  }
> = {
  Webcam: {
    coc: 0.002,
    sensorHeight: 3.6,
    cropFactor: 9.6 
  },
  Smartphone: {
    coc: 0.002,
    sensorHeight: 7.3,
    cropFactor: 6.1
  },
  "35mm (full frame)": {
    coc: 0.029,
    sensorHeight: 24,
    cropFactor: 1.0
  },
  "APS-C": {
    coc: 0.019,
    sensorHeight: 15.6,
    cropFactor: 1.52
  },
  "Micro Four Thirds": {
    coc: 0.015,
    sensorHeight: 13,
    cropFactor: 2.0
  },
  "6x6 (Medium Format)": {
    coc: 0.02,
    sensorHeight: 60,
    cropFactor: 0.55
  },
  "6x7 (Medium Format)": {
    coc: 0.025,
    sensorHeight: 70,
    cropFactor: 0.47
  },
};

const COMMON_SETUP_GROUPS: {
  groupLabel: string;
  items: { name: string; focalLength: number; aperture: number; idealDistance: number; sensor: string }[];
}[] = [
  {
    groupLabel: "فل فريم | Full Frame:",
    items: [
      { name: "17mm واسعة | 17mm Wide", focalLength: 17, aperture: 2.8, idealDistance: 36, sensor: "35mm (full frame)" },
      { name: "35mm تقريب | 35mm Standard", focalLength: 35, aperture: 1.4, idealDistance: 60, sensor: "35mm (full frame)" },
      { name: "70mm بورتريه | 70mm Portrait", focalLength: 70, aperture: 2.8, idealDistance: 96, sensor: "35mm (full frame)" },
      { name: "85mm بورتريه | 85mm Portrait", focalLength: 85, aperture: 1.4, idealDistance: 120, sensor: "35mm (full frame)" },
      { name: "105mm ماكرو | 105mm Macro", focalLength: 105, aperture: 2.8, idealDistance: 144, sensor: "35mm (full frame)" },
      { name: "135mm تيلي | 135mm Tele", focalLength: 135, aperture: 2.0, idealDistance: 180, sensor: "35mm (full frame)" },
    ],
  },
  {
    groupLabel: "كروب فريم | Crop Frame:",
    items: [
      { name: "24mm واسعة | 24mm Wide", focalLength: 24, aperture: 2.8, idealDistance: 48, sensor: "APS-C" },
      { name: "35mm تقريب | 35mm Standard", focalLength: 35, aperture: 1.8, idealDistance: 60, sensor: "APS-C" },
      { name: "50mm بورتريه | 50mm Portrait", focalLength: 50, aperture: 1.8, idealDistance: 80, sensor: "APS-C" },
      { name: "85mm بورتريه | 85mm Portrait", focalLength: 85, aperture: 1.8, idealDistance: 100, sensor: "APS-C" },
    ],
  },
  {
    groupLabel: "موبايل | Mobile:",
    items: [
      { name: "وايد | Wide", focalLength: 4.3, aperture: 2.0, idealDistance: 36, sensor: "Smartphone" },
      { name: "بورتريه | Portrait", focalLength: 6.8, aperture: 2.4, idealDistance: 48, sensor: "Smartphone" },
      { name: "تيلي | Tele", focalLength: 9.2, aperture: 2.8, idealDistance: 60, sensor: "Smartphone" },
    ],
  },
  {
    groupLabel: "ويب كام | Webcam:",
    items: [
      { name: "قياسي | Standard", focalLength: 3.6, aperture: 2.8, idealDistance: 36, sensor: "Webcam" },
    ],
  },
];

const SYSTEMS = ["Metric", "Imperial"] as const;

const SENSOR_LABELS: Record<string, string> = {
  Webcam: "ويب كام",
  Smartphone: "هاتف ذكي",
  "35mm (full frame)": "35mm (إطار كامل)",
  "APS-C": "APS-C",
  "Micro Four Thirds": "Micro Four Thirds",
  "6x6 (Medium Format)": "6x6 (متوسط)",
  "6x7 (Medium Format)": "6x7 (متوسط)",
};

const SUBJECT_LABELS: Record<string, string> = {
  Human: "شخص",
  "Human At Desk": "شخص على مكتب",
  "Small Dog": "كلب صغير",
  "Medium Dog": "كلب متوسط",
  "Large Dog": "كلب كبير",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function App() {
  const [distanceToSubjectInInches, setDistanceToSubjectInInches] =
    useState(72);
  const [focalLengthInMillimeters, setFocalLengthInMillimeters] = useState(50);
  const [aperture, setAperture] = useState(1.8);
  const [subject, setSubject] = useState("Human");
  const [system, setSystem] = useState<(typeof SYSTEMS)[number]>("Imperial");
  const [sensor, setSensor] = useState("35mm (full frame)");
  const [customSensorWidth, setCustomSensorWidth] = useState(36);
const [customSensorHeight, setCustomSensorHeight] = useState(24);

  const { colorMode, toggleColorMode } = useColorMode();

  const convertUnits = system === "Imperial" ? toImperial : toMetric;

  const distanceToSubjectInMM = distanceToSubjectInInches * 25.4;

  const isCustomSensor = sensor === "Custom";
const customCocCalculated = Math.sqrt(customSensorWidth ** 2 + customSensorHeight ** 2) / 1500;
const circleOfConfusionInMillimeters = isCustomSensor
  ? customCocCalculated
  : CIRCLES_OF_CONFUSION[sensor].coc;
const cropFactor = isCustomSensor
  ? 43.27 / Math.sqrt(customSensorWidth ** 2 + customSensorHeight ** 2)
  : CIRCLES_OF_CONFUSION[sensor].cropFactor;

  const hyperFocalDistanceInMM =
    focalLengthInMillimeters +
    (focalLengthInMillimeters * focalLengthInMillimeters) /
      (aperture * circleOfConfusionInMillimeters);
  const depthOfFieldFarLimitInMM =
    (hyperFocalDistanceInMM * distanceToSubjectInMM) /
    (hyperFocalDistanceInMM -
      (distanceToSubjectInMM - focalLengthInMillimeters));
  const depthOfFieldNearLimitInMM =
    (hyperFocalDistanceInMM * distanceToSubjectInMM) /
    (hyperFocalDistanceInMM +
      (distanceToSubjectInMM - focalLengthInMillimeters));

  const farDistanceInInches = 360;
  const nearFocalPointInInches = clamp(
    depthOfFieldNearLimitInMM / 25.4,
    0,
    farDistanceInInches
  );
  let farFocalPointInInches = clamp(
    depthOfFieldFarLimitInMM / 25.4,
    0,
    farDistanceInInches
  );
  if (farFocalPointInInches < nearFocalPointInInches) {
    farFocalPointInInches = farDistanceInInches;
  }

  const sensorHeight = isCustomSensor
  ? customSensorHeight
  : CIRCLES_OF_CONFUSION[sensor].sensorHeight;
  const verticalFieldOfView =
    (2 * Math.atan(sensorHeight / 2 / focalLengthInMillimeters) * 180) /
    Math.PI;

  // ── Derived photography values
  const hyperFocalDistanceInInches = hyperFocalDistanceInMM / 25.4;
  const isInfinityFar =
    depthOfFieldFarLimitInMM / 25.4 > farDistanceInInches ||
    depthOfFieldFarLimitInMM <= 0;
  const totalDofInches = farFocalPointInInches - nearFocalPointInInches;
  const canSetHyperfocal = hyperFocalDistanceInInches <= farDistanceInInches;

  // 35mm equivalent focal length (only relevant when not on full frame)
  const equivalentFocalLength = Math.round(
    focalLengthInMillimeters * cropFactor
  );

  // Diffraction: airy disk (0.001342 × N mm) should not exceed CoC
  const diffractionLimitFStop =
    circleOfConfusionInMillimeters / 0.001342;
  const hasDiffractionRisk = aperture > diffractionLimitFStop;

  // DoF use-case character based on total depth
  const totalDofFeet = totalDofInches / 12;
  const dofCharacter =
    totalDofFeet < 0.5
      ? { label: "ماكرو / منتج", color: "purple" }
      : totalDofFeet < 3
      ? { label: "نطاق البورتريه", color: "blue" }
      : totalDofFeet < 10
      ? { label: "مجموعة / حدث", color: "teal" }
      : totalDofFeet < 30
      ? { label: "شارع / عمارة", color: "green" }
      : { label: "مناظر طبيعية", color: "gray" };

  // ── Theme-aware colors 
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const graphicTextColor = useColorModeValue("#1A202C", "#F7FAFC");
  const nativeSelectStyles = buildNativeSelectStyles(colorMode);

  const labelStyles = {
    mt: "2",
    ml: "-2.5",
    fontSize: "sm",
  };

  const distanceMarks = useMemo(() => {
    if (system === "Imperial") {
      return new Array(Math.floor(farDistanceInInches / 24) + 1)
        .fill(0)
        .map((_v, i) => (i + 1) * 24)
        .map((val) => ({
          value: val,
          label: `${val / 12}'`,
        }));
    } else {
      const farDistanceInMeters = farDistanceInInches * 0.0254;
      const convertMetersToInches = (meters: number) => meters * 39.3701;
      return new Array(Math.floor(farDistanceInMeters) + 1)
        .fill(0)
        .map((_val, val) => ({
          value: convertMetersToInches(val + 1),
          label: `${val + 1}m`,
        }));
    }
  }, [system, farDistanceInInches]);

  return (
    <>
      {/* ── Header ── */}
      <Box
        className="qartaj-header"
        bg={useColorModeValue("white", "#111")}
        py={{ base: 4, md: 5 }}
        px={6}
      >
        <Flex justify="space-between" align="flex-start">
          <Box textAlign="right" flex={1}>
            <Text
              className="qartaj-title-ar"
              color="var(--qartaj-gold)"
              fontSize={{ base: "1.3rem", md: "1.75rem" }}
              fontWeight="800"
              lineHeight="1.2"
            >
              محاكي عمق الميدان
            </Text>
            <Text
              className="qartaj-title-en"
              fontSize={{ base: "0.75rem", md: "0.9rem" }}
              fontWeight="400"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={useColorModeValue("gray.500", "gray.400")}
            >
              Depth of Field Simulator
            </Text>
          </Box>
          <Flex gap={1} align="center">
            <WelcomeModal />
            <Tooltip
              label={
                colorMode === "dark" ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"
              }
            >
              <IconButton
                aria-label="تبديل وضع الألوان"
                icon={colorMode === "dark" ? <FiSun /> : <FiMoon />}
                size="sm"
                variant="ghost"
                className="qartaj-theme-btn"
                onClick={toggleColorMode}
              />
            </Tooltip>
          </Flex>
        </Flex>
        <Box mt={2} textAlign="right">
          <Text
            fontSize="sm"
            fontWeight="300"
            color={useColorModeValue("gray.600", "gray.400")}
          >
            احسب عمق الميدان والعزل حسب نوع الحساس، البعد البؤري، فتحة العدسة، والمسافة.
          </Text>
          <Text
            fontSize="xs"
            fontWeight="300"
            color={useColorModeValue("gray.400", "gray.500")}
            mt={0.5}
          >
            Calculate depth of field and background blur based on sensor size, focal length, aperture, and distance.
          </Text>
        </Box>
      </Box>

      <Box p={2} pt={4}>
        <PhotographyGraphic
          distanceToSubjectInInches={distanceToSubjectInInches}
          nearFocalPointInInches={nearFocalPointInInches}
          farFocalPointInInches={farFocalPointInInches}
          farDistanceInInches={farDistanceInInches}
          subject={subject as keyof typeof SUBJECTS}
          focalLength={focalLengthInMillimeters}
          aperture={aperture}
          system={system}
          verticalFieldOfView={verticalFieldOfView}
          textColor={graphicTextColor}
          onChangeDistance={(val) => setDistanceToSubjectInInches(val)}
        />
      </Box>

      {/* ── DoF Stats Panel ── */}
      <Box px={6} pt={2}>
        <SimpleGrid columns={4} spacing={3}>
          {[
            {
              label: "أقرب نقطة واضحة",
              value: convertUnits(nearFocalPointInInches, 0),
            },
            {
              label: "أبعد نقطة واضحة",
              value: isInfinityFar
                ? "∞"
                : convertUnits(farFocalPointInInches, 0),
            },
            {
              label: "عمق الميدان الكلي",
              value: isInfinityFar ? "∞" : convertUnits(totalDofInches, 0),
            },
            {
              label: "المسافة فائقة التركيز",
              value: convertUnits(hyperFocalDistanceInInches, 0),
            },
          ].map(({ label, value }) => (
            <Box
              key={label}
              className="qartaj-stat-card"
              rounded="xl"
              p={3}
            >
              <Text
                className="qartaj-stat-label"
                color={mutedText}
              >
                {label}
              </Text>
              <Text className="qartaj-stat-value" mt={1}>
                {value}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* DoF character badge + Set Hyperfocal action */}
        <Flex justify="space-between" align="center" mt={3}>
          <Badge
            colorScheme={dofCharacter.color}
            px={3}
            py={1}
            rounded="full"
            fontSize="sm"
          >
            {dofCharacter.label}
          </Badge>
          <Tooltip
            label={
              canSetHyperfocal
                ? "التركيز على المسافة فائقة التركيز — كل شيء من نصف هذه المسافة إلى ∞ سيكون واضحاً"
                : `المسافة فائقة التركيز (${convertUnits(hyperFocalDistanceInInches, 0)}) تتجاوز نطاق المشهد`
            }
          >
            <Button
              size="xs"
              variant="outline"
              colorScheme="teal"
              isDisabled={!canSetHyperfocal}
              onClick={() =>
                setDistanceToSubjectInInches(
                  Math.round(hyperFocalDistanceInInches)
                )
              }
            >
              تعيين المسافة فائقة التركيز
            </Button>
          </Tooltip>
        </Flex>
      </Box>

      {/* ── Controls ── */}
      <Box px={6}>
        <Box pt={4}>
          <Flex gap={2} align="center">
            <Flex w="20%" justify="flex-end" align="center" gap={1.5}>
              <Icon as={TbRuler} boxSize={4} color={mutedText} />
              <Text fontSize="sm">الوحدات</Text>
            </Flex>
            <Box flexGrow={1}>
              <RadioGroup
                onChange={(v) => setSystem(v as "Imperial" | "Metric")}
                value={system}
              >
                <Stack direction="row">
                  {SYSTEMS.map((s) => (
                    <Radio value={s} key={s} colorScheme="blue">
                      {s}
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            </Box>
          </Flex>
        </Box>

        {/* Subject Distance */}
        <Box pt={6}>
          <Flex gap={2} align="center">
            <Flex w="20%" justify="flex-end" align="center" gap={1.5}>
              <Icon as={TbRuler} boxSize={4} color={mutedText} />
              <Text fontSize="sm" textAlign="right">
                المسافة ({system === "Imperial" ? "قدم" : "م"})
              </Text>
            </Flex>
            <Box flexGrow={1}>
              <Slider
                aria-label="المسافة إلى الهدف"
                colorScheme="blue"
                value={distanceToSubjectInInches}
                onChange={(val: number) => setDistanceToSubjectInInches(val)}
                min={10}
                max={400}
                step={1}
              >
                {distanceMarks.map(({ label, value }) => (
                  <SliderMark key={value} value={value} {...labelStyles}>
                    {label}
                  </SliderMark>
                ))}
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </Flex>
        </Box>

        {/* Focal Length */}
        <Box pt={6}>
          <Flex gap={2} align="center">
            <Flex w="20%" justify="flex-end" align="center" gap={1.5}>
              <Icon as={TbZoomIn} boxSize={4} color={mutedText} />
              <Text fontSize="sm" textAlign="right">
                البعد البؤري (مم)
              </Text>
            </Flex>
            <Box flexGrow={1}>
              <Slider
                aria-label="البعد البؤري"
                colorScheme="blue"
                value={focalLengthInMillimeters}
                onChange={(val: number) => setFocalLengthInMillimeters(val)}
                min={3}
                max={400}
                step={1}
              >
                {[14, 28, 35, 50, 70, 85, 100, 135, 155, 200].map((val) => (
                  <SliderMark key={val} value={val} {...labelStyles}>
                    {val}
                  </SliderMark>
                ))}
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </Flex>
          <Flex gap={2} mt={2}>
            <Box w="20%"></Box>
            <Box flexGrow={1}>
              <Flex justify="space-between" align="center">
                <img src={Fisheye} alt="عدسة عين السمكة" style={{ height: 50 }} />
                {sensor !== "35mm (full frame)" && (
                  <Text fontSize="xs" color={mutedText}>
                    ≈ {equivalentFocalLength}مم ما يعادل الإطار الكامل
                  </Text>
                )}
                <img
                  src={Telephoto}
                  alt="عدسة 100-400"
                  style={{ height: 50 }}
                />
              </Flex>
            </Box>
          </Flex>
        </Box>

        {/* Aperture */}
        <Box pt={6}>
          <Flex gap={2} align="center">
            <Flex w="20%" justify="flex-end" align="center" gap={1.5}>
              <Icon as={TbAperture} boxSize={4} color={mutedText} />
              <Text fontSize="sm">فتحة العدسة</Text>
            </Flex>
            <Box flexGrow={1}>
              <Slider
                aria-label="فتحة العدسة"
                colorScheme="blue"
                value={aperture}
                onChange={(val: number) => setAperture(val)}
                min={0.8}
                max={22}
                step={0.1}
              >
                {[0.8, 1.4, 1.8, 2.8, 4, 5.6, 8, 11, 16, 22].map((val) => (
                  <SliderMark key={val} value={val} {...labelStyles}>
                    {val}
                  </SliderMark>
                ))}
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </Flex>
          {hasDiffractionRisk && (
            <Flex mt={2} justify="flex-start" pl="calc(20% + 8px)">
              <Badge
                colorScheme="orange"
                variant="subtle"
                px={2}
                py={0.5}
                fontSize="xs"
                rounded="md"
              >
                ⚠ قد يقلل الحيود من الحدة عند فتحة أصغر من f/
                {diffractionLimitFStop.toFixed(1)} على هذا الحساس
              </Badge>
            </Flex>
          )}
        </Box>

        {/* Sensor + Subject */}
        <Box pt={6}>
          {isCustomSensor && (
  <Box mt={2}>
    <Flex gap={2} align="center" mb={1}>
      <Text fontSize="xs" w="80px" color={mutedText}>العرض (مم)</Text>
      <input
        type="number"
        value={customSensorWidth}
        onChange={(e) => setCustomSensorWidth(Number(e.target.value))}
        style={{ width: 70, padding: "2px 6px", borderRadius: 6, border: "1px solid #ccc" }}
      />
    </Flex>
    <Flex gap={2} align="center" mb={1}>
      <Text fontSize="xs" w="80px" color={mutedText}>الارتفاع (مم)</Text>
      <input
        type="number"
        value={customSensorHeight}
        onChange={(e) => setCustomSensorHeight(Number(e.target.value))}
        style={{ width: 70, padding: "2px 6px", borderRadius: 6, border: "1px solid #ccc" }}
      />
    </Flex>
  </Box>
)}<Flex gap={3} direction={{ base: "column", md: "row" }}>
            <Flex gap={2} width={{ base: "100%", md: "50%" }}>
              <Flex
                w={{ base: "72px", md: "20%" }}
                mt={2}
                justify="flex-end"
                align="center"
                gap={1.5}
                flexShrink={0}
              >
                <Icon as={FiCamera} boxSize={4} color={mutedText} />
                <Text fontSize="sm" textAlign="right">
                  الحساس
                </Text>
              </Flex>
              <Box flexGrow={1}>
                  <Select
                    bg={nativeSelectStyles.bg}
                    color={nativeSelectStyles.color}
                    borderColor={nativeSelectStyles.borderColor}
                    iconColor={nativeSelectStyles.iconColor}
                    _hover={nativeSelectStyles._hover}
                    _focus={nativeSelectStyles._focus}
                    _active={nativeSelectStyles._active}
                    sx={nativeSelectStyles.sx}
                    value={sensor}
                    placeholder="اختر الحساس"
                    onChange={(evt) => {
                      if (!evt?.target?.value) {
                        return;
                      }
                      setSensor(evt?.target?.value);
                    }}
                  >
                    {Object.entries(CIRCLES_OF_CONFUSION).map(([key]) => (
                      <option key={key} value={key}>
                        {SENSOR_LABELS[key]}
                      </option>
                    ))}
                    <option value="Custom">مخصص</option>
                  </Select>
              </Box>
            </Flex>

            <Flex gap={2} width={{ base: "100%", md: "50%" }}>
              <Flex
                w={{ base: "72px", md: "20%" }}
                mt={2}
                justify="flex-end"
                align="center"
                gap={1.5}
                flexShrink={0}
              >
                <Icon as={TbUser} boxSize={4} color={mutedText} />
                <Text fontSize="sm" textAlign="right">
                  الهدف
                </Text>
              </Flex>
              <Box flexGrow={1}>
                  <Select
                    bg={nativeSelectStyles.bg}
                    color={nativeSelectStyles.color}
                    borderColor={nativeSelectStyles.borderColor}
                    iconColor={nativeSelectStyles.iconColor}
                    _hover={nativeSelectStyles._hover}
                    _focus={nativeSelectStyles._focus}
                    _active={nativeSelectStyles._active}
                    sx={nativeSelectStyles.sx}
                    value={subject}
                    placeholder="اختر الهدف"
                    onChange={(evt) => {
                      if (
                        SUBJECTS[evt?.target?.value as keyof typeof SUBJECTS]
                      ) {
                        setSubject(evt?.target?.value);
                      }
                    }}
                  >
                    {Object.entries(SUBJECTS).map(([key]) => (
                      <option key={key} value={key}>
                        {SUBJECT_LABELS[key]}
                      </option>
                    ))}
                  </Select>
              </Box>
            </Flex>
          </Flex>
        </Box>

        <Divider mt={6} borderColor={borderColor} />

        {/* Quick Presets */}
        <Box px={2} pt={2} pb={2}>
          <Box className="qartaj-presets-section">
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="var(--qartaj-gold)"
              textAlign="center"
              mb={4}
            >
              إعدادات سريعة | Quick Presets
            </Text>
            {COMMON_SETUP_GROUPS.map((group) => (
              <Box key={group.groupLabel} mb={4}>
                <Text
                  className="qartaj-preset-group-label"
                  color={useColorModeValue("gray.700", "gray.300")}
                  textAlign="right"
                  fontWeight="700"
                  fontSize="sm"
                  px={1}
                >
                  {group.groupLabel}
                </Text>
                <Wrap spacing={2}>
                  {group.items.map((setup) => (
                    <WrapItem key={setup.name}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="qartaj-preset-btn"
                        onClick={() => {
                          setFocalLengthInMillimeters(setup.focalLength);
                          setAperture(setup.aperture);
                          setSensor(setup.sensor);
                          setDistanceToSubjectInInches(setup.idealDistance);
                        }}
                      >
                        {setup.name}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Footer */}
        <Box className="qartaj-footer" textAlign="center">
          <Text className="qartaj-footer-name" mb={1}>
            <Icon as={FiHeart} className="qartaj-footer-heart" boxSize={3} mb={0.5} ml={1} />
            صُنع بحب من قبل نديم ديوب
          </Text>
          <Text className="qartaj-footer-en">
            Made with love by Nadeem Dayoub
          </Text>
        </Box>
      </Box>
    </>
  );
}

export default App;

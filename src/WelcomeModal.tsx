import { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  useColorModeValue,
  useDisclosure,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { FiHelpCircle, FiChevronLeft } from "react-icons/fi";

const LS_KEY = "qartaj-welcome-dismissed";

interface Section {
  title: string;
  enTitle: string;
  content: string;
  enContent: string;
}

const SECTIONS: Section[] = [
  {
    title: "ما هو التطبيق؟",
    enTitle: "What is this app?",
    content: "يساعدك على فهم تأثير إعدادات الكاميرا على العزل (Background Blur) وعمق الميدان (Depth of Field).",
    enContent: "This tool helps you understand how camera settings affect background blur and depth of field.",
  },
  {
    title: "البعد البؤري",
    enTitle: "Focal Length",
    content: "كلما زاد الرقم مثل 85mm أو 135mm زاد العزل وضاق عمق الميدان.",
    enContent: "Higher numbers (85mm, 135mm) create more background blur and narrower depth of field.",
  },
  {
    title: "فتحة العدسة",
    enTitle: "Aperture",
    content: "كلما كان رقم f أصغر مثل f/1.8 كان العزل أقوى.",
    enContent: "Lower f-numbers (f/1.8) create stronger background blur and shallower depth of field.",
  },
  {
    title: "المسافة",
    enTitle: "Distance",
    content: "كلما اقتربت من الهدف زاد العزل، وكلما ابتعدت زادت المنطقة الواضحة.",
    enContent: "Getting closer to the subject increases blur; moving away increases the sharp area.",
  },
  {
    title: "حجم الحساس",
    enTitle: "Sensor Size",
    content: "الحساس الأكبر مثل Full Frame يعطي عزل أقوى من Crop أو Mobile.",
    enContent: "Larger sensors (Full Frame) produce stronger blur than Crop or Mobile sensors.",
  },
  {
    title: "المنطقة الحمراء في الرسم",
    enTitle: "Red Area in Graphic",
    content: "الخط الأحمر يمثل نقطة التركيز Focus Point. والمنطقة الحمراء الشفافة تمثل عمق الميدان Depth of Field.",
    enContent: "The red line marks the focus point. The semi-transparent red area shows the depth of field.",
  },
  {
    title: "النتائج",
    enTitle: "Results Panel",
    content: "أقرب نقطة واضحة Near Limit - أبعد نقطة واضحة Far Limit - عمق الميدان الكلي Total DoF - المسافة فائقة التركيز Hyperfocal Distance.",
    enContent: "Near Limit, Far Limit, Total Depth of Field, and Hyperfocal Distance.",
  },
  {
    title: "الإعدادات الجاهزة",
    enTitle: "Quick Presets",
    content: "تساعدك على تجربة إعدادات مشهورة بسرعة لتصوير البورتريه والمنتجات والمناظر.",
    enContent: "Quickly try popular camera setups for portraits, products, and landscapes.",
  },
];

export default function WelcomeModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const dismissed = localStorage.getItem(LS_KEY);
    if (!dismissed) {
      onOpen();
    }
  }, [onOpen]);

  const handleDontShowAgain = () => {
    localStorage.setItem(LS_KEY, "true");
    onClose();
  };

  const sectionBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  return (
    <>
      <Button
        leftIcon={<Icon as={FiHelpCircle} />}
        size="sm"
        variant="ghost"
        onClick={onOpen}
        className="qartaj-help-btn"
        fontSize={{ base: "xs", md: "sm" }}
      >
        شرح الاستخدام | Help
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior="inside"
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent
          mx={4}
          maxH="85vh"
          borderRadius="2xl"
          overflow="hidden"
        >
          <ModalHeader
            borderBottom="1px"
            borderColor={borderColor}
            pb={4}
            textAlign="center"
          >
            <Text fontSize="xl" fontWeight="800" color="var(--qartaj-gold)">
              👋 أهلاً بك في محاكي عمق الميدان
            </Text>
            <Text fontSize="sm" fontWeight="400" color="gray.500" mt={1}>
              Welcome to the Depth of Field Simulator
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4}>
            {SECTIONS.map((section, i) => (
              <Flex
                key={i}
                mb={3}
                p={3}
                bg={sectionBg}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                gap={2}
                align="flex-start"
              >
                <Box
                  mt={0.5}
                  color="var(--qartaj-gold)"
                  flexShrink={0}
                >
                  <Icon as={FiChevronLeft} boxSize={4} />
                </Box>
                <Box flex={1}>
                  <Text fontWeight="700" fontSize="sm" color="var(--qartaj-gold)" mb={0.5}>
                    {section.title}
                    <Text as="span" fontWeight="400" color="gray.400" fontSize="xs" me={1}>
                      | {section.enTitle}
                    </Text>
                  </Text>
                  <Text fontSize="sm" lineHeight="1.6">
                    {section.content}
                  </Text>
                  <Text fontSize="xs" color="gray.400" mt={0.5}>
                    {section.enContent}
                  </Text>
                </Box>
              </Flex>
            ))}
          </ModalBody>
          <ModalFooter
            borderTop="1px"
            borderColor={borderColor}
            gap={3}
            flexDirection={{ base: "column", md: "row" }}
            pt={4}
          >
            <Button
              bg="var(--qartaj-gold)"
              color="var(--qartaj-black)"
              fontWeight="700"
              px={6}
              _hover={{ bg: "#c49f30" }}
              _active={{ transform: "scale(0.97)" }}
              onClick={onClose}
              width={{ base: "100%", md: "auto" }}
              fontSize="sm"
            >
              ابدأ التجربة | Start
            </Button>
            <Button
              variant="ghost"
              color="gray.500"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ bg: "gray.50", borderColor: "gray.300" }}
              onClick={handleDontShowAgain}
              width={{ base: "100%", md: "auto" }}
              fontSize="sm"
            >
              لا تظهر مرة أخرى | Don't show again
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

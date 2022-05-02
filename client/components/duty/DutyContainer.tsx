import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useDuty } from "../../context/DutyContext";
import { Box, Flex } from "@chakra-ui/react";
import DutyStart from "./DutyStart";
import DutyEnd from "./DutyEnd";
import DutySummary from "./DutySummary";
import InitialDeparture from "./InitialDeparture";
import LegList from "./LegList";
import LegEdit from "./LegEdit";
import ReceiptUpload from "./ReceiptUpload";

const VIEW_START_DUTY = "START_DUTY";
const VIEW_INITIAL_DEPARTURE = "INITIAL_DEPARTURE";
const VIEW_LEG_LIST = "LEG_LIST";
const VIEW_END_DUTY = "END_DUTY";
const VIEW_RECEIPT = "RECEIPT_VIEW";
const VIEW_LEG_EDIT = "LEG_EDIT";
const VIEW_DUTY_SUMMARY = "DUTY_SUMMARY";

const DutyContainer = () => {
  const { dutyData, setDutyData } = useDuty();

  const router = useRouter();
  console.log(router.query);

  useEffect(() => {
    if (router.query.id) {
      setDutyData({
        ...dutyData,
        currentDuty: router.query.id,
        currentView: "START_DUTY",
      });
    }
  }, [router.query.id]);

  // AVOID IMPORTING USECONTEXT BOILERPLATE INTO COMPONENT BY PASSING THIS FUNCTION
  const updateDutyContext = (dataObj) => {
    console.log("\n\nDATAOBJ: ", dataObj);
    setDutyData({ ...dutyData, ...dataObj });
  };

  let view;

  switch (dutyData.currentView) {
    case VIEW_START_DUTY:
      view = (
        <DutyStart
          id={dutyData.currentDuty}
          updateDutyContext={updateDutyContext}
        />
      );
      break;
    case VIEW_INITIAL_DEPARTURE:
      view = (
        <InitialDeparture
          id={dutyData.currentDuty}
          updateDutyContext={updateDutyContext}
        />
      );
      break;
    case VIEW_LEG_LIST:
      view = (
        <LegList
          id={dutyData.currentDuty}
          updateDutyContext={updateDutyContext}
        />
      );
      break;
    case VIEW_END_DUTY:
      view = (
        <DutyEnd
          id={dutyData.currentDuty}
          updateDutyContext={updateDutyContext}
        />
      );
      break;
    case VIEW_RECEIPT:
      view = <ReceiptUpload />;
      break;
    case VIEW_LEG_EDIT:
      view = (
        <LegEdit
          id={dutyData.currentDuty}
          updateDutyContext={updateDutyContext}
        />
      );
      break;
    case VIEW_DUTY_SUMMARY:
      view = <DutySummary />;
      break;
    default:
      view = (
        <DutyStart
          id={dutyData.currentDuty}
          updateDutyContext={updateDutyContext}
        />
      );
  }

  return (
    <Flex maxH={"80vh"} justify={"center"}>
      <Box minW={"100%"}>{view}</Box>
    </Flex>
  );
};

export default DutyContainer;

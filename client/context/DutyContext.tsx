import { useState, createContext, useContext, ReactNode } from "react";

interface IValue {
  currentDuty: string;
  currentView: string;
  planeSelection: string;
  currentLeg: string;
}

interface IDutyContext {
  dutyData: IValue;
  setDutyData: (value: IValue) => void;
}

type DutyProviderProps = {
  children: ReactNode;
};

const initVals = {
  currentDuty: "",
  currentView: "START_DUTY",
  planeSelection: "",
  currentLeg: "",
};

const DutyContext = createContext<Partial<IDutyContext>>({});

export const DutyProvider = ({ children }: DutyProviderProps) => {
  const [dutyData, setDutyData] = useState<IValue>(initVals);

  return (
    <DutyContext.Provider value={{ dutyData, setDutyData }}>
      {children}
    </DutyContext.Provider>
  );
};

export const useDuty = (): any => useContext(DutyContext);

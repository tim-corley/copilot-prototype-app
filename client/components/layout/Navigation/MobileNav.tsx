import React, { FC } from "react";
import MobileNavItem from "./MobileNavItem";
import { Stack, useColorModeValue } from "@chakra-ui/react";

type NavItem = {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
};

interface NavProps {
  navItems: NavItem[];
}

const MobileNav: FC<NavProps> = ({ navItems }) => {
  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      display={{ md: "none" }}
    >
      {navItems.map((item) => (
        <MobileNavItem key={item.label} {...item} />
      ))}
    </Stack>
  );
};

export default MobileNav;

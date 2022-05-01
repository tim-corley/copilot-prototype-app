import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Button,
  Stack,
  Collapse,
  Spinner,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";
import Link from "next/link";
import router from "next/router";
import navData from "../../data/nav-content.json";
import DesktopNav from "./Navigation/DesktopNav";
import MobileNav from "./Navigation/MobileNav";
import { useAuth } from "../../context/AuthContext";

type NavItem = {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
};

const navItems: NavItem[] = navData;

const NavBar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [mounted, setMounted] = useState(false);

  const { loading, user, logout, getToken } = useAuth();

  const logoutHandler = () => {
    logout();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const textAlign = useBreakpointValue({
    base: "center",
    md: "left",
  }) as any;

  const color = useColorModeValue("gray.800", "white");

  const handleNewDuty = async () => {
    const accessToken: string = await getToken();
    const resp = await axios.post("api/duty/new", {
      accessToken,
    });
    if (resp.data?.success) {
      router.push(`/duty/${encodeURIComponent(resp.data.duty.id)}`);
    }
  };

  return (
    <Box>
      <Flex
        bg={useColorModeValue("white", "gray.800")}
        color={useColorModeValue("gray.600", "white")}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align={"center"}
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          {mounted ? (
            <Link href="/">
              <Text textAlign={textAlign} fontFamily={"heading"} color={color}>
                Logo
              </Text>
            </Link>
          ) : (
            <Spinner />
          )}

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <DesktopNav navItems={navItems} />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={6}
        >
          {user ? (
            <Flex alignItems={"center"}>
              <Box fontSize={"lg"} mb={{ base: 8, md: 0 }}>
                {user.is_admin && (
                  <Link href="/admin" passHref>
                    <Text>Control Center</Text>
                  </Link>
                )}
                {user.is_staff && (
                  <Text onClick={handleNewDuty}>Start New Duty</Text>
                )}
              </Box>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar
                    size={"sm"}
                    src={
                      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                    }
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem>Link 1</MenuItem>
                  <MenuItem>Link 2</MenuItem>
                  <MenuDivider />
                  <MenuItem>
                    {" "}
                    <Link href="">
                      <a onClick={logoutHandler}>Logout</a>
                    </Link>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          ) : (
            <>
              <Link href="/login">
                <Button
                  as={"a"}
                  fontSize={"sm"}
                  fontWeight={400}
                  variant={"link"}
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  display={{ base: "none", md: "inline-flex" }}
                  fontSize={"sm"}
                  fontWeight={600}
                  color={"white"}
                  bg={"brand.900"}
                  _hover={{
                    bg: "brand.900",
                  }}
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav navItems={navItems} />
      </Collapse>
    </Box>
  );
};

export default NavBar;

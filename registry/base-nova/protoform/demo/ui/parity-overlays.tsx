import { useState } from 'react';
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '@/components/ui/accordion/index';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog/index';
import { Button } from '@/components/ui/button/index';
import { MenuContextTrigger } from '@/components/ui/context-menu/index';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer/index';
import { Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuTrigger } from '@/components/ui/dropdown-menu/index';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card/index';
import { Menubar } from '@/components/ui/menubar/index';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu/index';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination/index';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet/index';
import { ParitySection } from './parity-shared';

export function OverlayExamples() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [activity, setActivity] = useState('No sample action yet.');
  const [showDetails, setShowDetails] = useState(false);
  const [page, setPage] = useState(1);
  return (
    <div className="grid min-w-0 gap-6 md:grid-cols-2" data-testid="parity-overlays">
      <ParitySection title="Accordion">
        <Accordion>
          <AccordionItem value="advanced">
            <AccordionTrigger>Advanced validation</AccordionTrigger>
            <AccordionPanel>Validation remains owned by your form schema.</AccordionPanel>
          </AccordionItem>
          <AccordionItem disabled value="disabled">
            <AccordionTrigger>Unavailable section</AccordionTrigger>
            <AccordionPanel>Not interactive.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </ParitySection>
      <ParitySection title="Alert dialog">
        <p className="text-sm">This only changes a local sample, never stored records.</p>
        {deleted === true ? (
          <>
            <p role="status">Sample record removed.</p>
            <Button onClick={() => setDeleted(false)} type="button" variant="outline">
              Restore sample
            </Button>
          </>
        ) : (
          <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
            <AlertDialogTrigger
              render={
                <Button type="button" variant="destructive">
                  Remove sample record
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this sample record?</AlertDialogTitle>
                <AlertDialogDescription>The sample can be restored. No server request is sent.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose>Cancel</AlertDialogClose>
                <AlertDialogClose
                  onClick={() => {
                    setDeleted(true);
                    setConfirmOpen(false);
                  }}
                  variant="destructive"
                >
                  Confirm removal
                </AlertDialogClose>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </ParitySection>
      <ParitySection title="Sheet">
        <Sheet>
          <SheetTrigger
            render={
              <Button type="button" variant="outline">
                Open field sheet
              </Button>
            }
          />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Field details</SheetTitle>
              <SheetDescription>A side panel for form metadata.</SheetDescription>
            </SheetHeader>
            <div className="p-4 text-sm">Name: display_name</div>
            <SheetFooter>
              <SheetClose
                render={
                  <Button type="button" variant="outline">
                    Close field sheet
                  </Button>
                }
              />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </ParitySection>
      <ParitySection title="Drawer">
        <Drawer>
          <DrawerTrigger
            render={
              <Button type="button" variant="outline">
                Open form drawer
              </Button>
            }
          />
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Form preview</DrawerTitle>
              <DrawerDescription>A swipeable presentation drawer.</DrawerDescription>
            </DrawerHeader>
            <p className="p-4 text-sm">Use this layout without changing schema or submission behavior.</p>
            <DrawerFooter>
              <DrawerClose
                render={
                  <Button type="button" variant="outline">
                    Close form drawer
                  </Button>
                }
              />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </ParitySection>
      <ParitySection title="Dropdown menu">
        <Menu>
          <MenuTrigger
            render={
              <Button type="button" variant="outline">
                Schema actions
              </Button>
            }
          />
          <MenuContent>
            <MenuItem onClick={() => setActivity('Sample schema duplicated.')}>Duplicate schema</MenuItem>
            <MenuCheckboxItem checked={showDetails} onCheckedChange={setShowDetails} value="bookmarks">
              Show metadata
            </MenuCheckboxItem>
            <MenuItem disabled>Publish unavailable</MenuItem>
          </MenuContent>
        </Menu>
        <p className="text-sm">Metadata: {showDetails === true ? 'shown' : 'hidden'}</p>
      </ParitySection>
      <ParitySection title="Context menu">
        <Menu>
          <div className="rounded-md border border-dashed p-3 text-center text-sm">
            <MenuContextTrigger className="flex min-h-24 items-center justify-center">
              Right-click for sample field actions
            </MenuContextTrigger>
          </div>
          <MenuContent>
            <MenuItem onClick={() => setActivity('Sample field duplicated.')}>Duplicate field</MenuItem>
          </MenuContent>
        </Menu>
      </ParitySection>
      <ParitySection title="Menubar">
        <Menubar>
          <Menu>
            <MenuTrigger>Sample file</MenuTrigger>
            <MenuContent>
              <MenuItem onClick={() => setActivity('New sample form created.')}>New form</MenuItem>
            </MenuContent>
          </Menu>
        </Menubar>
      </ParitySection>
      <ParitySection title="Navigation menu">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Explore catalog</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#parity-heading">Catalog overview</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </ParitySection>
      <ParitySection title="Hover card">
        <HoverCard>
          <HoverCardTrigger
            render={
              <Button type="button" variant="link">
                About schema metadata
              </Button>
            }
          />
          <HoverCardContent>
            <p className="text-sm">Schema metadata describes fields without changing submitted values.</p>
          </HoverCardContent>
        </HoverCard>
      </ParitySection>
      <ParitySection title="Pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={page === 1}
                href="#parity-heading"
                onClick={(event) => {
                  event.preventDefault();
                  setPage(Math.max(1, page - 1));
                }}
              />
            </PaginationItem>
            {[1, 2, 3].map((number) => (
              <PaginationItem key={number}>
                <PaginationLink
                  href="#parity-heading"
                  isActive={page === number}
                  onClick={(event) => {
                    event.preventDefault();
                    setPage(number);
                  }}
                >
                  {number}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                aria-disabled={page === 3}
                href="#parity-heading"
                onClick={(event) => {
                  event.preventDefault();
                  setPage(Math.min(3, page + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <output aria-label="Current sample page">Page {page} of 3</output>
      </ParitySection>
      <p className="text-sm md:col-span-2" role="status">
        {activity}
      </p>
    </div>
  );
}

import { ConfirmationDialog } from '@components/core';
import { Location } from 'history';
import { FC, useEffect, useState } from 'react';
import { Prompt, useHistory } from 'react-router-dom';

interface RouteLeavingGuardProps {
  when?: boolean | undefined;
  navigate: (path: string) => void;
  shouldBlockNavigation: (location: Location) => boolean;
}
const RouteLeavingGuard: FC<RouteLeavingGuardProps> = ({
  when,
  navigate,
  shouldBlockNavigation
}: RouteLeavingGuardProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [lastLocation, setLastLocation] = useState<Location | null>(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);

  const closeModal = () => {
    setModalVisible(false);
  };
  const handleBlockedNavigation = (nextLocation: Location): boolean => {
    if (!confirmedNavigation && shouldBlockNavigation(nextLocation)) {
      setModalVisible(true);
      setLastLocation(nextLocation);
      return false;
    }
    return true;
  };
  const handleConfirmNavigationClick = () => {
    setModalVisible(false);
    setConfirmedNavigation(true);
  };

  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      // Navigate to the previous blocked location with your navigate function
      navigate(lastLocation.pathname);
    }
  }, [confirmedNavigation, lastLocation]);
  return (
    <>
      <Prompt when={when} message={handleBlockedNavigation} />
      {/* Your own alert/dialog/modal component */}
      <ConfirmationDialog
        open={modalVisible}
        onClose={closeModal}
        title="Are you sure you want to leave?"
        content="You have unsaved changes, if you leave the page all changes are lost."
        actions={[
          { label: 'Cancel', callback: closeModal },
          { label: 'Confirm', callback: handleConfirmNavigationClick }
        ]}
      />
    </>
  );
};
export default RouteLeavingGuard;

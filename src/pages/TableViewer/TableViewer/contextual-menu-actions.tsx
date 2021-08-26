import { Action } from '@components/core/MenuActions';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import LinkRoundedIcon from '@material-ui/icons/LinkRounded';
import SettingsEthernetRoundedIcon from '@material-ui/icons/SettingsEthernetRounded';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import LibraryAddCheckRoundedIcon from '@material-ui/icons/LibraryAddCheckRounded';
import styles from './TableViewer.module.scss';

export const CONTEXT_MENU_ACTIONS: Record<string, Action[][]> = {
  cell: [
    [
      {
        id: 'context-edit',
        label: 'Edit cell',
        Icon: <EditRoundedIcon className={styles.ContextMenuIcon} />
      },
      {
        id: 'context-reconciliate',
        label: 'Reconciliate cell',
        Icon: <LinkRoundedIcon className={styles.ContextMenuIcon} />
      },
      {
        id: 'context-manage-metadata',
        label: 'Manage metadata',
        Icon: <SettingsEthernetRoundedIcon className={styles.ContextMenuIcon} />
      }
    ], [
      {
        id: 'context-delete-column',
        label: 'Delete column',
        Icon: <DeleteOutlineRoundedIcon className={styles.ContextMenuIcon} />
      },
      {
        id: 'context-delete-row',
        label: 'Delete row',
        Icon: <DeleteOutlineRoundedIcon className={styles.ContextMenuIcon} />
      }
    ]
  ],
  column: [
    [
      {
        id: 'context-select-column',
        label: 'Select column',
        Icon: <LibraryAddCheckRoundedIcon className={styles.ContextMenuIcon} />
      }
    ],
    [
      {
        id: 'context-delete-column',
        label: 'Delete column',
        Icon: <DeleteOutlineRoundedIcon className={styles.ContextMenuIcon} />
      }
    ]
  ]
};

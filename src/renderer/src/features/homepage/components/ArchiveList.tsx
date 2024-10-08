import React from 'react';
import { useTreeStateStore } from '@/store/treeStateStore';
import { UniqueIdentifier } from '@dnd-kit/core';
import { List, ListItemText, ListItemButton, Box, Button, Typography, Divider } from '@mui/material';
import { Unarchive } from '@mui/icons-material';
import { useTreeManagement } from '@/hooks/useTreeManagement';
import { useAppStateStore } from '@/store/appStateStore';

export const ArchiveList = () => {
  const currentTree = useTreeStateStore((state) => state.currentTree);
  const setCurrentTree = useTreeStateStore((state) => state.setCurrentTree);
  const isAccordionExpanded = useAppStateStore((state) => state.isAccordionExpanded);
  const setIsFocusedTreeName = useAppStateStore((state) => state.setIsFocusedTreeName);
  const treesList = useTreeStateStore((state) => state.treesList);
  const setIsShowArchive = useAppStateStore((state) => state.setIsShowArchive);

  const { handleChangeIsArchived } = useTreeManagement();
  const { loadAndSetCurrentTreeDataFromIdb } = useTreeManagement();

  const handleUnArchiveClick = (treeId: UniqueIdentifier) => {
    handleChangeIsArchived(treeId, false);
  };

  const handleListClick = async (treeId: UniqueIdentifier): Promise<void> => {
    if (currentTree === treeId) {
      return;
    }
    setCurrentTree(treeId);
    await loadAndSetCurrentTreeDataFromIdb(treeId);
    setIsShowArchive(false);
    if (isAccordionExpanded) {
      // 0.5秒後にフォーカスをセット
      setTimeout(() => {
        setIsFocusedTreeName(true);
      }, 500);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: '900px',
        width: '100%',
        marginX: 'auto',
      }}
    >
      <Box sx={{ py: 4 }}>
        <Typography variant='h6' sx={{ textAlign: 'center' }}>
          アーカイブ済みツリー
        </Typography>
      </Box>
      <Box sx={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 2, p: 0 }}>
        <List
          sx={{
            m: 0,
            p: 0,
            textAlign: 'left',
          }}
        >
          {treesList
            .filter((tree) => tree.isArchived)
            .map((tree, index) => (
              <React.Fragment key={tree.id}>
                <ListItemButton onClick={async () => await handleListClick(tree.id)} sx={{ width: '100%' }}>
                  <ListItemText
                    primary={tree.name}
                    sx={{
                      width: '100%',
                    }}
                  />
                  <Button
                    startIcon={<Unarchive />}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleUnArchiveClick(tree.id);
                    }}
                    sx={{ width: 90 }}
                  >
                    戻す
                  </Button>
                </ListItemButton>
                {index !== treesList.filter((tree) => tree.isArchived).length - 1 && <Divider sx={{ width: '100%' }} />}
              </React.Fragment>
            ))}
          {treesList.filter((tree) => tree.isArchived).length === 0 && (
            <Typography sx={{ textAlign: 'center', my: 2, width: '100%' }}>アーカイブ済みのツリーはありません</Typography>
          )}
        </List>
      </Box>
    </Box>
  );
};

import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { ListItem, ListItemAvatar, ListItemText, Avatar} from '@mui/material';
import { Inbox } from '@mui/icons-material';
/*
const useStyles = makeStyles({
  draggingListItem: {
    background: 'rgb(235,235,235)'
  }
});*/

const DraggableListItem = (props) => {
    const {item, index} = props
  //const classes = useStyles();
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {/*className={snapshot.isDragging ? classes.draggingListItem : ''}*/}
          <ListItemAvatar>
            <Avatar>
              <Inbox />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={item.primary} secondary={item.secondary} />
        </ListItem>
      )}
    </Draggable>
  );
};

export default DraggableListItem;

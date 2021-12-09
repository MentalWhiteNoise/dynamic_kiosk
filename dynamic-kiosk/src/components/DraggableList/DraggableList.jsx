import * as React from 'react';
import DraggableListItem from '../DraggableListItem';
import {
  DragDropContext,
  Droppable,
} from 'react-beautiful-dnd';

const DraggableList = (props) => {
    const {items, onDragEnd } = props;
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-list">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((item, index) => (
              <DraggableListItem item={item} index={index} key={item.id} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableList;

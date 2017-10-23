import React from 'react';
import CategoriesTableHeader from "./CategoriesTableHeader";
import CategoriesTableRow from "./CategoriesTableRow";
import RaisedButton from 'material-ui/RaisedButton';

const CategoriesPane =({categories, updateColor, updateHours, addCategory}) => (
  <div>
    <h2>Categories</h2>
    <CategoriesTableHeader/>
    {
      categories.map((category, index) => (
        <CategoriesTableRow key={index}
                            category={category}
                            categoryIndex={index}
                            updateColor={updateColor}
                            updateHours={updateHours}
        />
      ))
    }
    <div className="text-right">
      <RaisedButton
        label="Add Category"
        default={true}
        onClick={addCategory}
      />
    </div>
  </div>
);

export default CategoriesPane;

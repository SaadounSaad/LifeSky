
import React from "react";
import { FaStar } from "react-icons/fa"; // 📌 Import des étoiles

const StarRating = ({ value, onChange }) => {
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <FaStar
            key={index}
            size={24} // 📌 Réduction de la taille (anciennement 30)
            color={ratingValue <= value ? "rgb(168, 200, 235)" : "#D3D3D3"} //  bleu si sélectionné, gris sinon
            onClick={() => onChange(ratingValue)}
            style={{ cursor: "pointer", marginRight: 3 }}
          />
        );
      })}
    </div>
  );
};

export default StarRating;

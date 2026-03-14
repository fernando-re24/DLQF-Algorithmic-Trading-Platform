# DLQF-Algorithmic-Trading-Platform
Platform for participants in the DLQF Algorithmic Trading Platform to upload submission models for evaluation and ranking.

The web app will handle end user activities from admins and competitors. Competitors will be able to create an account from which
they can sign up for competitions and join teams. A user should then be able to download data files and submit finals materials
from the competition page. Admins will be able to create and manage competitons, upload data files, and view results from eval.
Data files, submitted materials, and data files will be stored on and acessed from the no-sql based backend.

The web app is designed such that the endpoints for the evaluation engine are general to any competiton, regardless of the nature 
of submissions and evaluation of those files. The evaluation engine will be designed for a specfifc competition while meeting 
those endpoints. 

The current evaluation engine is designed for a time series forecasting competition. Cometitors will submit a pytorch model
(will eventually generalize) and a feature generation script. These files will be fed into the simulator container and a set
of evaluation metrics and vizualizations will be returned in JSON form.

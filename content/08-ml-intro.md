# Supervised Learning
-------------------------
## Machine Learning Tree
![](image/mltree.png)

-------------------------
## UnderFit & OverFit
![](image/uo.png)

-------------------------
## Bias & Variance
![](image/bias.png)

-------------------------
##  Preprocessing
>#### Label Encoding
```python
from sklearn.preprocessing import LabelEncoder
```
>#### One Hot Encoding
```python
import pandas as pd
pd.get_dummies(df['column'])
```
>#### Standard Scaler
```python
from sklearn.preprocessing import StandardScaler
```
>#### Min-Max Scaler
```python
from sklearn.preprocessing import MinMaxScaler
```
-------------------------
## SAMPLING

>#### Hold out
![](image/hold_one.jpeg)
```python
from sklearn.model_selection import train_test_split
```

>#### Leave One Out
![](image/leave.png)
```python
from sklearn.model_selection import LeaveOneOut
```

>#### K-Fold
![](image/k-fold.png)
```python
from sklearn.model_selection import KFold
```

>#### Stratified K-Fold
![](image/stratified.png)
```python
from sklearn.model_selection import StratifiedKFold
```
-------------------------
## MODELING
### REGRESSION

>#### Linear Regression
```python
from sklearn.linear_model import LinearRegression
```
>#### Decision Tree
```python
from sklearn.tree import DecisionTreeRegressor
```
>#### Support Vector Machines
```python
from sklearn.svm import SVR
```

### CLASSIFICATION
>#### Logistic Regression
```python
from sklearn.linear_model import LogisticRegression
```
>#### Naïve Bayes
```python
from sklearn.naive_bayes import GaussianNB,BernoulliNB,MultinomialNB
```
>#### Decision Tree
```python
from sklearn.tree import DecisionTreeClassifier
```
>#### Support Vector Machines
```python
from sklearn.svm import SVC
```

-------------------------
## Performance Metrics
### REGRESSION
>#### Mean Absolute Error (MAE)
```python
from sklearn.metrics import mean_absolute_error
```
>#### Mean Squared Error (MSE)
```python
from sklearn.metrics import mean_squared_error
```
>#### Root Mean Squared Error (RMSE)
```python
from sklearn.metrics import mean_squared_error
import numpy as np
np.sqrt(mean_squared_error(y_test,y_pred))
```
>#### R-Squared
```python
from sklearn.metrics import r2_score
```
>#### Adjusted R-squared
```python
from sklearn.metrics import r2_score
import numpy as np
r2=r2_score(y_test,y_pred)
n=len(y_test)
#Number of features
k=1
adjusted_r2 = 1 - (1 - r2) * (n - 1) / (n - k - 1)
```

### CLASSIFICATION
>#### Accuracy
```python
from sklearn.metrics import accuracy_score
```
>#### Precision and Recall
```python
from sklearn.metrics import precision_score, recall_score
```
>#### Specificity
```python
from sklearn.metrics import confusion_matrix
tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
specificity = tn / (tn + fp)
```
>#### F1-score
```python
from sklearn.metrics import f1_score
```
>#### AUC-ROC
```python
from sklearn.metrics import roc_auc_score
```
-------------------------
# Final Code
>## Regression

```python
#Essential Library
import pandas as pd
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt
from sklearn.tree import plot_tree
from sklearn.preprocessing import MinMaxScaler,OrdinalEncoder,StandardScaler,LabelEncoder

#Data Reading using pandas
df=pd.read_csv('regression_data.csv')

X = df.drop('target',axis=1)
y = df['target']

#Preprocessing
scale=MinMaxScaler()
label=OrdinalEncoder()
X[X.select_dtypes(exclude='object').columns]=scale.fit_transform(X.select_dtypes(exclude='object'))
X[X.select_dtypes(include='object').columns]=label.fit_transform(X.select_dtypes(include='object'))

#Sampling
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

#Training
model = DecisionTreeRegressor(random_state=42)
decision_tree.fit(X_train, y_train)

#Evaluate
y_pred = decision_tree.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"Mean Squared Error: {mse}")
print(f"R^2 Score: {r2}")
```

>## Classification

```python
#Essential Library
import pandas as pd
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report
import matplotlib.pyplot as plt
from sklearn.tree import plot_tree
from sklearn.preprocessing import MinMaxScaler,OrdinalEncoder,StandardScaler,LabelEncoder

#Data Reading using pandas
df=pd.read_csv('classification_data.csv')

X = df.drop('target',axis=1)
y = df['target']

#Preprocessing
scale=MinMaxScaler()
label=OrdinalEncoder()
X[X.select_dtypes(exclude='object').columns]=scale.fit_transform(X.select_dtypes(exclude='object'))
X[X.select_dtypes(include='object').columns]=label.fit_transform(X.select_dtypes(include='object'))

#Sampling
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

#Training
model = DecisionTreeClassifier(random_state=42)
decision_tree.fit(X_train, y_train)

#Evaluate
y_pred = decision_tree.predict(X_test)
print(classification_report(y_test, y_pred))
```




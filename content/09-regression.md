# Supervised Learning
> ## Linear regression
**Definition:**
       Linear regression analysis is used to predict the value of a variable based on the value of another variable. The variable you want to predict is called the dependent variable. The variable you are using to predict the other variable's value is called the independent variable.

**Formula:**
$$y=mx+c$$

$where:$ 
$y =output \ variable$ 
$m =slope$ 
$x =input \ feature$ 
$b =intercept$ 

- **observed value** means data \ sets point.
- **predicted value** means Regression  \ line point.
- **residual value** called error.

#### Linear regression model:

![](https://miro.medium.com/v2/resize:fit:1100/format:webp/0*VQa8qPj0orzNC_WD.png)
![](https://miro.medium.com/v2/resize:fit:1100/format:webp/0*63rRz5p3zYRYLS9K.png)
#### Slope(M):
- if y = mx + b, then **m** is the **slope**.
<br>
- Slope of regression line represents the change in y as x changes, if y is dependent of x. Slope is also known as both the coefficient of slope and the regression coefficient.
<br>
- Slope is used to describe the steepness of a line. The definition of slope is the rise of a line over the run of a line, or the change in the vertical direction (y) over the change in the horizontal direction (x).

#### Formula:
$$slope =(y₂ - y₁)/(x₂ - x₁)$$

#### Slope model:

![](https://i.ytimg.com/vi/4wFBHxCH_9E/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAZa-jBX6SKE4XtYp55eFaDugSRBQ)

> ## DECISION TREE

![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*kduu5gzQ0xXkPteD9UIq0g.png)

In regression, a Decision Tree predicts a continuous target variable instead of a class label. The tree is constructed similarly, but instead of trying to make nodes pure in terms of class distribution, it tries to reduce the variance of the target variable within each node. Each internal node still represents a split based on a feature, but now the goal is to minimize the error (variance) within each partition. 

**Key Metric (Mean Squared Error or Mean Absolute Error):** 

For regression trees, the quality of a split is evaluated based on how well it reduces the variance in the target values. Two common criteria are Mean Squared Error 

**Mean Squared Error (MSE):**

$$MSE=N1_i=1∑N(y_i-y)^2$$
  where $$ ( y_i ) $$ is the actual target value for each sample,\( \bar{y} \) is the mean target value for the samples in the node,and \( N \) is the total number of samples.<br>
The tree tries to minimize the reduction in variance when splitting:
$$ Variance Reduction=Variance(Parent)-j j∑∣N∣∣Nj∣×Variance(Nj) $$       
           

**Decision Process:**
1. For each split, calculate the variance reduction or MSE.
2. Choose the feature and split that result in the lowest error.
3. Repeat the process for each child node until the stopping criterion is met.


<br>

> ## SUPPORT VECTOR MACHINE

![](https://hands-on.cloud/wp-content/uploads/2021/12/Overview-of-supervised-learning-SVM-1024x576.png)

The primary objective of the **SVM algorithm** is to identify the **optimal hyperplane** in an N-dimensional space that can effectively separate data points into different classes in the feature space.

**Key Terms and Components**
1. **Hyperplane**:

    - A hyperplane is a decision boundary that separates different classes in feature space.
    <br>

1. **Margin**:

    - The margin is the distance between the hyperplane and the closest data points from each class.

|**Aspect**|**Hard Margin SVM**|**Soft Margin SVM**|
| :-: | :-: | :-: |
|**Misclassification**|No errors allowed (perfect separation).|Allows some errors for flexibility.|
|**Objective**|Maximize margin only.|Maximize margin + minimize errors .|
|**Sensitivity to Outliers**|Very sensitive.|Less sensitive due to tolerance for some misclassified points.|
|**Use Case**|Ideal for perfectly separable data without outliers.|Suitable for real-world, non-separable data.|

![](https://miro.medium.com/v2/resize:fit:828/format:webp/1*o_2ubtLPO3qQfaPIyJMS9g.png)

3. **Support Vectors**:
   - Support vectors are the data points that are closest to the hyperplane.

![](As012.png)
> ## SUPPORT VECTOR REGRESSOR(SVR)
- For regression tasks, SVM aims to predict a continuous value based on input features.
<br>
-  Finds a function that deviates from the actual target values not greater than a specified margin (epsilon). It aims to fit as many data points as possible within this margin while minimizing the model complexity.
<br>

- Loss Function: SVR typically uses the epsilon-insensitive loss function, which ignores errors within a certain threshold (epsilon).
<br>
- Kernel Trick:

|**Model**|**Kernel**|**Decision Boundary**|
| :-: | :-: | :-: |
|Linear SVR|This kernel is used when the data is linearly separable. It computes the dot product of the input features directly, resulting in a linear decision boundary.|![](https://copyassignment.com/wp-content/uploads/2022/08/Linear-model-768x768.png)|
|Non-linear SVR|These kernels transform the input space into a higher-dimensional space where a linear separation might be possible, making it possible to fit curves instead of straight lines. Kernels include: **Polynomial**: Fits polynomial trends.**Radial Basis Function(RBF)**: Allows for complex, radial fit patterns.|![](https://copyassignment.com/wp-content/uploads/2022/08/Non-Linear-model-768x768.png)|



**Formula:**
$$ f(x)=w⋅x+b $$

- $f(x)$: Predicted output for input x.
- $w$: Weight vector that determines the slope of the regression line.
- $b$: Bias term, which shifts the regression line up or down.

**Optimization**

SVR minimizes the weight vector w to create a line that best approximates the data points within a specified margin (epsilon $ ϵ $):

$$min⁡w,b12∣w∣2\min\_{w, b} \frac{1}{2} |w|^2w,bmin​21​∣w∣2$$

The goal is to minimize the model’s complexity by keeping w small, which helps prevent overfitting and ensures the model generalizes well to new data.



**$epsilonϵ $**: Margin of tolerance around the regression line. Points within this margin are considered close enough, and deviations are not penalized.

___


<h1 align="center">
CLASSIFICATION
</h1>

> ## Logistic regression
•	Logistic regression is a mathematical model, which predicts the probability of occurrence of y given the information of X, a previous event.<br>
•	Give X, logistic regression predicts whether Y will occur or not. Logistic regression is a binary event, which means Y can be either 0 or 1.<br>
•	Y gets the value1, if event occurs and Y gets the value 0 if the event does not occur.<br>
•	Logistic regression is mainly used for classification applications like spam, email detection, diabetes detection for a person based on various features provided etc.<br>
**Some examples….**
•	Popular applications include – spam detection, customer choice prediction – i.e. if the customer will click a particular link or not?
•	Will the customer buy the product or not?
•	Diabetes/cancer prediction and more

<u>**Difference of liner and logistic regression**</u>

LINEAR REGRESSION|LOGISTIC REGRESSION
---|:---:
Its an approach to model relationship between the dependent and independent variables|Its more statistical in nature where the model predicts the outcome which could be one of the two values

<p align="center">
<img src="https://cdn.analyticsvidhya.com/wp-content/uploads/2024/08/711091.webp" alt="Raspberry pi" style="width:80%; border:0;">
</p>

<p align="center">
<img src="https://www.saedsayad.com/images/LogReg_1.png" alt="Raspberry pi" style="width:80%; border:0">
</p>

X axis => input variables
Y axis => predicted probability

- In graph, between the values 0 and 1 called threshold values. Once get threshold values the respective one decided yes or no.
- The sigmoid function, also called logistic function gives an ‘S’ shaped curve that can take any real-valued number and map it into a value between 0 and 1.
$$p=\dfrac{1}{(1 + e^{-z})}$$
$$p=\dfrac{1}{1 + e^{({-(w0 + w1*x1 + w2*x2 + … + wn*xn)})}}$$

where:
$z = w0 + w1*x1 + w2*x2 + … + wn*xn$
p = probability of the positive class (1)
e = base of the natural logarithm (approximately 2.718)
z = weighted sum of input variables.
<br>

>## Navie Bayes

The Naïve Bayes classifier is a supervised machine learning algorithm that is used for classification tasks such as text classification. **They use principles of probability to perform classification tasks**

**Explanation:**
    Naive Bayes is a probability-based machine learning algorithm that uses Bayes' theorem with the assumption of “naive” independence between the variables (features), making it effective for small datasets. **The Naive Bayes algorithms are most useful for classification problems and predictive modeling.**

 1) Naïve Bayes algorithm is a supervised learning algorithm, which is based on Bayes theorem and used for solving classification problems.
 2) It is mainly used in text classification that includes a high-dimensional training dataset.

 3) Naïve Bayes Classifier is one of the simple and most effective Classification algorithms

 4) which helps in building the fast machine learning models that can make quick predictions.

 5) It is a probabilistic classifier, which means it predicts on the basis of the probability of an object.

Naive Bayes is a simple and powerful algorithm for predictive modeling. The model comprises two types of probabilities that can be calculated directly from the training data: 

 (i) The probability of each class and
 (ii) The conditional probability for each class given each x value.<br>

 **Formula:**
$$  𝑃(𝑌|𝑋)=𝑃(𝑌)𝑃(𝑋|𝑌)/𝑃(𝑋)$$

<p align="center">
<img src="https://miro.medium.com/v2/resize:fit:1400/1*39U1Ln3tSdFqsfQy6ndxOA.png" alt="Raspberry pi" style="width:100%; border:0">
</p>

<p align="center">
<img src="https://mlarchive.com/wp-content/uploads/2023/02/Implementing-Naive-Bayes-Classification-using-Python-1-1.png" alt="Raspberry pi" style="width:100%; border:0">
</p>




> ## Decision Tree for Classification 

**Explanation**: 

In classification tasks, a Decision Tree works by recursively splitting the data based on feature values to maximize the "purity" of each resulting subset. The goal is to create a series of decision rules that result in terminal nodes (leaves) that ideally contain only one class. Each internal node represents a decision on a feature, with branches leading to child nodes based on that decision. This process continues until the model reaches a stopping condition (e.g., max depth, minimum samples per leaf).

**Key Metric (Gini Impurity or Entropy):**

The main criteria to decide on a split are Gini impurity or Entropy. These measures help quantify how "pure" a node is in terms of class distribution.

Gini Impurity: Measures the likelihood of an incorrect classification by randomly choosing a class based on the class distribution in the node.

$$Gini(t)=1-i=1∑C​p(i∣t)2$$

where \( C \) is the total number of classes, and \( p(i|t) \) is the probability of a randomly chosen element being classified into class \( i \) in node \( t \).

Entropy: Measures the disorder or impurity within a node.

$$Entropy(t)=-i=1∑C​p(i∣t)log_2​(p(i∣t))$$

where \( p(i|t) \) is the probability of class \( i \) in node \( t \).

To choose the best split, we calculate the information gain:

$$Information Gain=Entropy(Parent)-j∑​∣N∣∣Nj​∣​×Entropy(Nj​)$$

where \( N \) is the number of samples in the parent node, and \( N_j \) is the number of samples in each child node \( j \).

![Decision Tree Classification Algorithm](https://images.javatpoint.com/tutorial/dms/images/applications-of-tree-in-discrete-mathematics6.png)

**Decision Process:**

1\. Calculate the Gini or Entropy for all possible splits.

2\. Choose the feature and split point that provide the highest information gain.

3\. Repeat this process for each child node until the stopping criterion is met.
<br><br>

> ## Support Vector Classification (SVC)

![](https://www.tutorialspoint.com/scikit_learn/images/marginal_hyperplane.jpg)

Objective: The goal of SVC is to find a hyperplane that best separates different classes in the feature space.

Formula: The decision function for a linear SVC can be expressed as:

$$ [ f(x) = w \cdot x + b ] $$

$ Where:$

- $( f(x) )$ is the output of the model for input $( x )$.
- $( w )$ is the weight vector (normal to the hyperplane).
- $( x )$ is the input feature vector.
- $( b )$ is the bias term (offset from the origin).

Optimization Problem: The optimization problem for SVC can be formulated as:

$$ [ \min\_{w, b} \frac{1}{2} |w|^2 ] $$


$$ [ y_i (w \cdot x_i + b) \geq 1 \quad \forall_i ] $$

Where:

- $$( y_i  )$$ is the class label for the training sample $$( x_i )$$
- The constraint (either +1 or -1)ensures that the samples are correctly classified and at least a distance of 1 from the decision boundary.

Kernel Trick: For non-linear SVC, a kernel function $$( K(x_i,x_j) )$$ is used to transform the input space into a higher-dimensional space. The decision function becomes:

$$[ f(x) = ∑_{i=1}^{N} α_i y_i K(x_i,x) + b ]$$

___
# [NEXT](supervised.md)

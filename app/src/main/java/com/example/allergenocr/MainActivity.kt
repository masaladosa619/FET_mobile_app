package com.example.allergenocr

import android.Manifest
import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.compose.runtime.collectAsState
import com.example.allergenocr.ui.theme.AllergenOCRTheme
import com.example.allergenocr.ui.theme.DangerRed
import com.example.allergenocr.ui.theme.SafeGreen
import com.google.accompanist.permissions.*
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class AllergenViewModel : ViewModel() {
    private val _allergens = MutableStateFlow<List<String>>(listOf("Peanut", "Dairy", "Gluten"))
    val allergens: StateFlow<List<String>> = _allergens.asStateFlow()

    private val _scanResult = MutableStateFlow<ScanResult>(ScanResult.Idle)
    val scanResult: StateFlow<ScanResult> = _scanResult.asStateFlow()

    fun addAllergen(allergen: String) {
        val current = _allergens.value.toMutableList()
        if (allergen.isNotBlank() && !current.contains(allergen.trim())) {
            current.add(allergen.trim())
            _allergens.value = current
        }
    }

    fun removeAllergen(allergen: String) {
        _allergens.value = _allergens.value.filter { it != allergen }
    }

    fun analyzeText(text: String) {
        if (text.isBlank()) {
            _scanResult.value = ScanResult.Idle
            return
        }
        val lowerText = text.lowercase()
        val found = _allergens.value.filter { lowerText.contains(it.lowercase()) }
        if (found.isNotEmpty()) {
            _scanResult.value = ScanResult.Danger(found)
        } else {
            _scanResult.value = ScanResult.Safe
        }
    }
}

sealed class ScanResult {
    object Idle : ScanResult()
    object Safe : ScanResult()
    data class Danger(val detectedAllergens: List<String>) : ScanResult()
}

class MainActivity : ComponentActivity() {
    private val viewModel: AllergenViewModel by viewModels()
    private lateinit var cameraExecutor: ExecutorService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        cameraExecutor = Executors.newSingleThreadExecutor()
        
        setContent {
            AllergenOCRTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation(viewModel, cameraExecutor)
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown()
    }
}

@Composable
fun AppNavigation(viewModel: AllergenViewModel, cameraExecutor: ExecutorService) {
    var currentScreen by remember { mutableStateOf("profile") }

    if (currentScreen == "profile") {
        ProfileScreen(
            viewModel = viewModel,
            onNavigateToScanner = { currentScreen = "scanner" }
        )
    } else {
        ScannerScreen(
            viewModel = viewModel,
            cameraExecutor = cameraExecutor,
            onNavigateBack = { currentScreen = "profile" }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(viewModel: AllergenViewModel, onNavigateToScanner: () -> Unit) {
    val allergens by viewModel.allergens.collectAsState()
    var newAllergen by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Allergies", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onNavigateToScanner) {
                Icon(Icons.Filled.CameraAlt, contentDescription = "Scan")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = newAllergen,
                    onValueChange = { newAllergen = it },
                    label = { Text("Add Allergen") },
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(onClick = {
                    viewModel.addAllergen(newAllergen)
                    newAllergen = ""
                }) {
                    Icon(Icons.Filled.Add, contentDescription = "Add")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            Text("Active Allergens:", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(8.dp))

            LazyColumn {
                items(allergens) { allergen ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(allergen, fontSize = 18.sp)
                            IconButton(onClick = { viewModel.removeAllergen(allergen) }) {
                                Icon(Icons.Filled.Delete, contentDescription = "Remove", tint = MaterialTheme.colorScheme.error)
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun ScannerScreen(
    viewModel: AllergenViewModel,
    cameraExecutor: ExecutorService,
    onNavigateBack: () -> Unit
) {
    val cameraPermissionState = rememberPermissionState(permission = Manifest.permission.CAMERA)

    if (cameraPermissionState.status.isGranted) {
        CameraPreviewContent(viewModel, cameraExecutor, onNavigateBack)
    } else {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Camera permission is required to scan ingredients.")
            Spacer(modifier = Modifier.height(8.dp))
            Button(onClick = { cameraPermissionState.launchPermissionRequest() }) {
                Text("Grant Permission")
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CameraPreviewContent(
    viewModel: AllergenViewModel,
    cameraExecutor: ExecutorService,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val scanResult by viewModel.scanResult.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Scanner") },
                navigationIcon = {
                    Button(onClick = onNavigateBack, modifier = Modifier.padding(start = 8.dp)) {
                        Text("Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)) {
            AndroidView(
                factory = { ctx ->
                    val previewView = PreviewView(ctx).apply {
                        this.scaleType = PreviewView.ScaleType.FILL_CENTER
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                    }

                    val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                    cameraProviderFuture.addListener({
                        val cameraProvider = cameraProviderFuture.get()
                        
                        val preview = Preview.Builder().build().also {
                            it.setSurfaceProvider(previewView.surfaceProvider)
                        }

                        val imageAnalyzer = ImageAnalysis.Builder()
                            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                            .build()
                            .also {
                                it.setAnalyzer(cameraExecutor, TextAnalyzer(viewModel))
                            }

                        val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                        try {
                            cameraProvider.unbindAll()
                            cameraProvider.bindToLifecycle(
                                lifecycleOwner,
                                cameraSelector,
                                preview,
                                imageAnalyzer
                            )
                        } catch (exc: Exception) {
                            Log.e("AllergenOCR", "Use case binding failed", exc)
                        }
                    }, ContextCompat.getMainExecutor(ctx))

                    previewView
                },
                modifier = Modifier.fillMaxSize()
            )

            // Result Overlay
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .padding(16.dp)
            ) {
                when (scanResult) {
                    is ScanResult.Danger -> {
                        val danger = scanResult as ScanResult.Danger
                        Card(
                            colors = CardDefaults.cardColors(containerColor = DangerRed),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("DANGER", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 24.sp)
                                Text("Allergens detected: ${danger.detectedAllergens.joinToString()}", color = Color.White)
                            }
                        }
                    }
                    is ScanResult.Safe -> {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = SafeGreen),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("SAFE", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 24.sp)
                                Text("No allergens detected in view", color = Color.White)
                            }
                        }
                    }
                    is ScanResult.Idle -> {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color.DarkGray.copy(alpha = 0.8f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                "Point camera at ingredients...",
                                color = Color.White,
                                modifier = Modifier.padding(16.dp),
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
        }
    }
}

class TextAnalyzer(private val viewModel: AllergenViewModel) : ImageAnalysis.Analyzer {
    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    @SuppressLint("UnsafeOptInUsageError")
    override fun analyze(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
            recognizer.process(image)
                .addOnSuccessListener { visionText ->
                    viewModel.analyzeText(visionText.text)
                }
                .addOnFailureListener { e ->
                    Log.e("TextAnalyzer", "Text recognition error", e)
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }
}

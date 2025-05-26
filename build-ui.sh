#!/bin/bash

# KATch2 UI Build Script
# Builds WASM files and copies them to the katch2ui directory

# Multiple deployment directories
DEPLOY_DIRS=(
    "/Users/jules/git/netkat-www/"
    "/Users/jules/git/julesjacobs.github.io/misc/katch2/"
)

# Parse command line arguments
DEPLOY=false
if [ "$1" = "--deploy" ]; then
    DEPLOY=true
fi

echo "🔨 Building KATch2 WASM module..."

# Change to project root to build WASM files
cd ..

# Build WASM files
wasm-pack build --target web

if [ $? -ne 0 ]; then
    echo "❌ WASM build failed"
    exit 1
fi

echo "📦 Copying WASM files to katch2ui directory..."

# Ensure the katch2ui/pkg directory exists
mkdir -p ui/katch2ui/pkg

# Remove old files and copy new ones
rm -rf ui/katch2ui/pkg/*
cp -r pkg/* ui/katch2ui/pkg/

if [ $? -eq 0 ]; then
    echo "✅ KATch2 UI updated with latest WASM files"
    echo ""
    echo "📁 Files copied to ui/katch2ui/pkg/:"
    ls -la ui/katch2ui/pkg/
    echo ""
    
    # Handle deployment if --deploy flag is provided
    if [ "$DEPLOY" = true ]; then
        
        echo "🚀 Deploying to multiple GitHub Pages directories..."
        
        # Deploy to each directory
        for DEPLOY_DIR in "${DEPLOY_DIRS[@]}"; do
            echo ""
            echo "📦 Deploying to: $DEPLOY_DIR"
            
            # Check if deployment directory exists
            if [ ! -d "$DEPLOY_DIR" ]; then
                echo "❌ Deployment directory does not exist: $DEPLOY_DIR"
                echo "   Skipping this deployment target..."
                continue
            fi
            
            echo "📦 Copying UI files to $DEPLOY_DIR..."
            
            # Copy the entire ui folder contents to the deployment directory
            cp -r ui/* "$DEPLOY_DIR/"
            
            # Remove .gitignore from pkg directory to allow WASM files to be committed
            if [ -f "$DEPLOY_DIR/katch2ui/pkg/.gitignore" ]; then
                rm "$DEPLOY_DIR/katch2ui/pkg/.gitignore"
                echo "🗑️  Removed .gitignore from pkg directory to allow WASM files to be committed"
            fi
            
            if [ $? -eq 0 ]; then
                echo "✅ Successfully deployed to: $DEPLOY_DIR"
                
                # Navigate to the GitHub Pages repo and commit changes
                echo "🔄 Committing and pushing changes to repository at $DEPLOY_DIR..."
                cd "$DEPLOY_DIR"
                
                # Check if this is a git repository
                if [ ! -d ".git" ]; then
                    echo "⚠️  Not a git repository: $DEPLOY_DIR"
                    echo "   Files copied but not committed"
                    cd - > /dev/null  # Return to original directory
                    continue
                fi
                
                # Check if there are any changes to commit
                if git diff --quiet && git diff --cached --quiet; then
                    echo "ℹ️  No changes to commit in $DEPLOY_DIR"
                else
                    # Add all changes
                    git add .
                    
                    # Create a commit with timestamp
                    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
                    git commit -m "Update KATch2 tutorial - $TIMESTAMP"
                    
                    if [ $? -eq 0 ]; then
                        # Push to remote
                        git push
                        
                        if [ $? -eq 0 ]; then
                            echo "✅ Successfully pushed changes to remote for $DEPLOY_DIR"
                        else
                            echo "❌ Failed to push changes to remote repository for $DEPLOY_DIR"
                        fi
                    else
                        echo "❌ Failed to commit changes for $DEPLOY_DIR"
                    fi
                fi
                
                # Return to the original directory
                cd - > /dev/null
            else
                echo "❌ Failed to deploy files to $DEPLOY_DIR"
            fi
        done
        
        echo ""
        echo "🎉 Deployment process completed for all targets!"
        
    else
        echo "🚀 Ready to deploy! Run with --deploy to copy to multiple GitHub Pages directories:"
        for DEPLOY_DIR in "${DEPLOY_DIRS[@]}"; do
            echo "   - $DEPLOY_DIR"
        done
        echo "   Or manually copy the ui/ directory."
    fi
else
    echo "❌ Failed to copy WASM files"
    exit 1
fi 